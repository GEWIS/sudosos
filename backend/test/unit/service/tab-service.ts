/**
 *  SudoSOS back-end API service.
 *  Copyright (C) 2026 Study association GEWIS
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *  @license
 */

import fs from 'fs';
import { DataSource } from 'typeorm';
import sinon from 'sinon';
import Stripe from 'stripe';
import { expect } from 'chai';
import Config from '../../../src/config';
import { STRIPE_API_VERSION } from '../../../src/service/stripe-service';
import TabService, {
  TabStateError, TerminalNotFoundError, TerminalUnavailableError,
} from '../../../src/service/tab-service';
import TransactionService, {
  LockedTabTransactionError,
  TerminalPaidTransactionError,
} from '../../../src/service/transaction-service';
import BalanceService from '../../../src/service/balance-service';
import InvoiceService from '../../../src/service/invoice-service';
import StripeWebhookService from '../../../src/service/stripe-webhook-service';
import TransferService, { TransferCategory } from '../../../src/service/transfer-service';
import { StripePaymentIntentState } from '../../../src/entity/stripe/stripe-payment-intent-status';
import { PdfCompiler } from '../../../src/service/pdf/pdf-service';
import Tab, { TabStatus } from '../../../src/entity/tab/tab';
import TabPaymentAttempt from '../../../src/entity/tab/tab-payment-attempt';
import User, { UserType } from '../../../src/entity/user/user';
import InvoiceUser from '../../../src/entity/user/invoice-user';
import StripePaymentIntent from '../../../src/entity/stripe/stripe-payment-intent';
import Transaction from '../../../src/entity/transactions/transaction';
import PointOfSaleRevision from '../../../src/entity/point-of-sale/point-of-sale-revision';
import Mailer from '../../../src/mailer';
import { TransactionRequest } from '../../../src/controller/request/transaction-request';
import { TAB_RECEIPT_PDF_LOCATION } from '../../../src/files/storage';
import { defaultBefore, finishTestDB } from '../../helpers/test-helpers';
import { TerminalPaymentSeeder } from '../../seed';

const FAKE_PAYMENT_INTENT = 'fake_tab_payment_intent_do_not_use';
const FAKE_READER_ID = 'fake_tab_reader_id_do_not_use';

async function expectRejection(promise: Promise<unknown>, errorClass: new (...args: any[]) => Error) {
  let error: unknown;
  try {
    await promise;
  } catch (e) {
    error = e;
  }
  expect(error).to.be.instanceOf(errorClass);
}

describe('TabService', () => {
  let ctx: {
    connection: DataSource;
    admin: User;
    buildRequest: (fromId: number) => TransactionRequest;
    price: number;
    setPosLogin: (useAuthentication: boolean) => Promise<unknown>;
  };

  let originalStripeKey: string | undefined;
  let processIntentStub: sinon.SinonStub;
  let cancelActionStub: sinon.SinonStub;
  let cancelIntentStub: sinon.SinonStub;
  let listReadersStub: sinon.SinonStub;
  let intentCounter = 0;

  beforeAll(async () => {
    originalStripeKey = process.env.STRIPE_PRIVATE_KEY;
    process.env.STRIPE_PRIVATE_KEY = process.env.STRIPE_PRIVATE_KEY || 'sk_test_dummy';
    Config.reset();

    const { connection } = await defaultBefore();

    const admin = await User.save({
      firstName: 'Admin',
      type: UserType.LOCAL_ADMIN,
      active: true,
      tosRequired: false,
    } as User);

    const { catalogue } = await new TerminalPaymentSeeder().seed([admin]);
    const { products, containers, pointOfSale } = catalogue!;
    const product = products.grimbergenRevision;
    const price = product.priceInclVat.toObject();

    const buildRequest = (fromId: number): TransactionRequest => ({
      from: fromId,
      createdBy: admin.id,
      pointOfSale: { id: pointOfSale.bar.id, revision: pointOfSale.barRevision.revision },
      subTransactions: [{
        to: containers.alcoholic.owner.id,
        container: { id: containers.alcoholic.id, revision: containers.alcoholicRevision.revision },
        subTransactionRows: [{
          product: { id: product.product.id, revision: product.revision },
          amount: 1,
          totalPriceInclVat: price,
        }],
        totalPriceInclVat: price,
      }],
      totalPriceInclVat: price,
    });

    // Tabs only exist at a borrel-mode point of sale: one where people do not log in.
    const setPosLogin = (useAuthentication: boolean) => PointOfSaleRevision.update(
      { pointOfSaleId: pointOfSale.bar.id, revision: pointOfSale.barRevision.revision },
      { useAuthentication },
    );
    await setPosLogin(false);

    ctx = { connection, admin, buildRequest, price: product.priceInclVat.getAmount(), setPosLogin };
  });

  afterAll(async () => {
    if (originalStripeKey === undefined) {
      delete process.env.STRIPE_PRIVATE_KEY;
    } else {
      process.env.STRIPE_PRIVATE_KEY = originalStripeKey;
    }
    Config.reset();
    await finishTestDB(ctx.connection);
  });

  beforeEach(() => {
    const sampleStripe = new Stripe('sk_test_dummy', { apiVersion: STRIPE_API_VERSION });
    sinon.stub(Object.getPrototypeOf(sampleStripe.paymentIntents), 'create')
      .callsFake(async () => ({ id: `${FAKE_PAYMENT_INTENT}_${intentCounter++}`, client_secret: null }));
    cancelIntentStub = sinon.stub(Object.getPrototypeOf(sampleStripe.paymentIntents), 'cancel')
      .resolves({ status: 'canceled' } as any);
    listReadersStub = sinon.stub(Object.getPrototypeOf(sampleStripe.terminal.readers), 'list')
      .resolves({ data: [{ id: FAKE_READER_ID, label: 'Bar', status: 'online' }] } as any);
    processIntentStub = sinon.stub(Object.getPrototypeOf(sampleStripe.terminal.readers), 'processPaymentIntent')
      .resolves({ id: FAKE_READER_ID } as any);
    cancelActionStub = sinon.stub(Object.getPrototypeOf(sampleStripe.terminal.readers), 'cancelAction')
      .resolves({ id: FAKE_READER_ID } as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  async function openTab(name = 'Borrel group'): Promise<Tab> {
    return new TabService().createTab({
      name, contactName: 'Contact Person', contactEmail: 'contact@example.com', ofAge: true,
    }, ctx.admin);
  }

  async function sell(tab: Tab): Promise<Transaction> {
    const service = new TransactionService();
    const req = ctx.buildRequest(tab.user.id);
    const { valid, context } = await service.verifyTransaction(req);
    expect(valid).to.be.true;
    return service.createTransaction(req, context!);
  }

  /** Start paying the tab and have the reader collect, like the controller does. */
  async function pay(tab: Tab): Promise<StripePaymentIntent> {
    const service = new TabService();
    await service.startPayment(tab.id, FAKE_READER_ID);
    await service.collectOnTerminal(tab.id);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return latestIntent(tab);
  }

  async function latestIntent(tab: Tab): Promise<StripePaymentIntent> {
    const attempt = await TabPaymentAttempt.findOne({
      where: { tabId: tab.id }, relations: { paymentIntent: true }, order: { paymentIntentId: 'DESC' },
    });
    return attempt!.paymentIntent;
  }

  describe('createTab', () => {
    it('should open a tab backed by a TAB user that can go into debt', async () => {
      const tab = await openTab();
      expect(tab.status).to.equal(TabStatus.OPEN);
      expect(tab.user.type).to.equal(UserType.TAB);
      expect(tab.user.canGoIntoDebt).to.be.true;
      expect(tab.user.email).to.equal('contact@example.com');
      expect((await new TabService().getOutstanding(tab)).getAmount()).to.equal(0);
    });
  });

  describe('selling', () => {
    it('should not suggest a tab account as a recently charged user', async () => {
      const tab = await openTab();
      await sell(tab);
      // Make the point of sale of that sale one where people log in, which is
      // what the recently-charged suggestions are built from.
      await ctx.setPosLogin(true);
      try {
        const users = await new TransactionService().getRecentlyChargedUsers(ctx.admin.id);
        expect(users.map((u) => u.id)).to.not.include(tab.user.id);
      } finally {
        await ctx.setPosLogin(false);
      }
    });

    it('should not sell to a tab at a point of sale where people log in', async () => {
      const tab = await openTab();
      await ctx.setPosLogin(true);
      try {
        const { valid } = await new TransactionService().verifyTransaction(ctx.buildRequest(tab.user.id));
        expect(valid).to.be.false;
      } finally {
        await ctx.setPosLogin(false);
      }
    });
  });

  describe('payment', () => {
    it('should lock the tab while paying and reopen it when Stripe cancels', async () => {
      const tab = await openTab();
      const transaction = await sell(tab);
      await sell(tab);
      const service = new TabService();
      const outstanding = await service.getOutstanding(tab);
      expect(outstanding.getAmount()).to.equal(2 * ctx.price);

      const locked = await service.startPayment(tab.id, FAKE_READER_ID);
      expect(locked.status).to.equal(TabStatus.LOCKED);
      // The reader is only told to collect once the payment is recorded.
      expect(processIntentStub.called).to.be.false;
      await service.collectOnTerminal(tab.id);
      expect(processIntentStub.calledOnce).to.be.true;
      const intent = await latestIntent(tab);
      expect(intent.amount.getAmount()).to.equal(outstanding.getAmount());

      // The ledger is frozen while the reader collects.
      const { valid } = await new TransactionService().verifyTransaction(ctx.buildRequest(tab.user.id));
      expect(valid).to.be.false;
      await expectRejection(new TransactionService().deleteTransaction(transaction.id), LockedTabTransactionError);

      await service.reopenAfterStripe(intent);
      expect((await service.getTab(tab.id))!.status).to.equal(TabStatus.OPEN);
    });

    it('should cancel the reader action and intent when SudoSOS cancels', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await pay(tab);

      const reopened = await service.cancelPayment(tab.id);
      expect(reopened.status).to.equal(TabStatus.OPEN);
      expect(cancelActionStub.calledOnceWith(FAKE_READER_ID)).to.be.true;
      expect((await latestIntent(tab)).cancelledWithAPI).to.be.true;
    });

    it('should not start a payment for a tab without purchases', async () => {
      const tab = await openTab();
      await expectRejection(new TabService().startPayment(tab.id, FAKE_READER_ID), TabStateError);
    });

    it('should treat the transactions on a paid tab as paid by card terminal', async () => {
      const tab = await openTab();
      const transaction = await sell(tab);
      const other = await sell(await openTab());
      const intent = await pay(tab);
      await new StripeWebhookService().createNewPaymentIntentStatus(intent.id, StripePaymentIntentState.SUCCEEDED);

      const transactionService = new TransactionService();
      expect(await transactionService.isPaidByTerminal(transaction.id)).to.be.true;
      expect(await transactionService.isPaidByTerminal(other.id)).to.be.false;
      const [records] = await transactionService.getTransactions({});
      expect(records.find((t) => t.id === transaction.id)!.paidByTerminal).to.be.true;
      expect(records.find((t) => t.id === other.id)!.paidByTerminal).to.be.false;

      await expectRejection(
        transactionService.updateTransaction(transaction.id, ctx.buildRequest(tab.user.id)),
        TerminalPaidTransactionError,
      );
      await expectRejection(transactionService.deleteTransaction(transaction.id), TerminalPaidTransactionError);
      expect(await Transaction.findOne({ where: { id: transaction.id } })).to.not.be.null;
    });

    it('should settle the tab and email the receipt when the payment succeeds', async () => {
      const tab = await openTab();
      await sell(tab);
      await sell(tab);
      const service = new TabService();
      const intent = await pay(tab);

      // The real webhook path: the deposit handling credits the tab user,
      // then the tab is settled with that same transfer.
      await new StripeWebhookService().createNewPaymentIntentStatus(intent.id, StripePaymentIntentState.SUCCEEDED);
      const paid = (await service.getTab(tab.id))!;
      expect(paid.status).to.equal(TabStatus.PAID);
      expect(paid.lockedAt).to.be.null;
      expect(paid.transfer!.amountInclVat.getAmount()).to.equal(intent.amount.getAmount());

      // Booked as a Stripe deposit, not as a manual creation.
      const transferService = new TransferService();
      const [deposits] = await transferService.getTransfers({ category: TransferCategory.DEPOSIT });
      expect(deposits.map((t) => t.id)).to.include(paid.transfer!.id);
      const [manual] = await transferService.getTransfers({ category: TransferCategory.MANUAL_CREATION });
      expect(manual.map((t) => t.id)).to.not.include(paid.transfer!.id);
      const balance = await new BalanceService().getBalance(tab.user.id);
      expect(balance.amount.amount).to.equal(0);
      const user = await User.findOne({ where: { id: tab.user.id } });
      expect(user!.active).to.be.false;

      // A second settlement of the same tab leaves it as it is.
      expect(await service.settlePaidIntent(intent)).to.be.null;
      expect((await service.getTab(tab.id))!.transfer!.id).to.equal(paid.transfer!.id);

      fs.mkdirSync(TAB_RECEIPT_PDF_LOCATION, { recursive: true });
      sinon.stub(PdfCompiler, 'compile').resolves(Buffer.from('PDF content'));
      const sendStub = sinon.stub().resolves();
      sinon.stub(Mailer, 'getInstance').returns({ send: sendStub } as any);

      await service.sendReceipt((await service.getTab(tab.id))!);
      expect(sendStub.calledOnce).to.be.true;
      const [recipient, , , options] = sendStub.firstCall.args;
      expect(recipient.email).to.equal('contact@example.com');
      expect(recipient.firstName).to.equal('Contact Person');
      expect(options.attachments[0].content).to.equal(Buffer.from('PDF content').toString('base64'));
      expect(options.attachments[0].encoding).to.equal('base64');
      expect((await Tab.findOne({ where: { id: tab.id } }))!.pdf).to.not.be.null;
    });

    it('should reopen the tab when the card payment fails, so it can be paid again', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      const failed = await pay(tab);

      await new StripeWebhookService().createNewPaymentIntentStatus(failed.id, StripePaymentIntentState.FAILED);
      expect((await service.getTab(tab.id))!.status).to.equal(TabStatus.OPEN);

      // A retry mints a fresh intent for the same amount.
      const retry = await pay(tab);
      expect(retry.id).to.not.equal(failed.id);
      expect(retry.amount.getAmount()).to.equal(failed.amount.getAmount());
      expect((await service.getTab(tab.id))!.status).to.equal(TabStatus.LOCKED);
    });

    it('should ignore Stripe ending an attempt that is no longer in progress', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      const old = await pay(tab);
      await service.cancelPayment(tab.id);
      await pay(tab);

      await service.reopenAfterStripe(old);
      expect((await service.getTab(tab.id))!.status).to.equal(TabStatus.LOCKED);
    });

    it('should not start a payment on an unknown or busy reader', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await expectRejection(service.startPayment(tab.id, 'unknown_reader'), TerminalNotFoundError);

      listReadersStub.resolves({
        data: [{
          id: FAKE_READER_ID, label: 'Bar', status: 'online', action: { status: 'in_progress' },
        }],
      } as any);
      await expectRejection(service.startPayment(tab.id, FAKE_READER_ID), TerminalUnavailableError);
      expect((await service.getTab(tab.id))!.status).to.equal(TabStatus.OPEN);
    });

    it('should not start a second payment while one is in progress', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await pay(tab);
      await expectRejection(service.startPayment(tab.id, FAKE_READER_ID), TabStateError);
      expect(await TabPaymentAttempt.count({ where: { tabId: tab.id } })).to.equal(1);
    });

    it('should cancel the payment and reopen the tab when the reader refuses it', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await service.startPayment(tab.id, FAKE_READER_ID);
      processIntentStub.rejects(new Error('Reader offline'));

      expect(await service.collectOnTerminal(tab.id)).to.be.false;
      expect((await service.getTab(tab.id))!.status).to.equal(TabStatus.OPEN);
      expect(cancelIntentStub.calledOnce).to.be.true;
    });

    it('should keep the tab locked when the reader refuses and the payment cannot be cancelled', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await service.startPayment(tab.id, FAKE_READER_ID);
      processIntentStub.rejects(new Error('Reader offline'));
      cancelIntentStub.rejects(Object.assign(new Error('Unexpected state'), { payment_intent: { status: 'succeeded' } }));

      await expectRejection(service.collectOnTerminal(tab.id), TabStateError);
      expect((await service.getTab(tab.id))!.status).to.equal(TabStatus.LOCKED);
    });

    it('should not collect a payment that was cancelled before the reader was told', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await service.startPayment(tab.id, FAKE_READER_ID);
      await service.cancelPayment(tab.id);

      await expectRejection(service.collectOnTerminal(tab.id), TabStateError);
      expect(processIntentStub.called).to.be.false;
    });

    it('should still edit and delete purchases on an open tab', async () => {
      const tab = await openTab();
      const first = await sell(tab);
      const second = await sell(tab);
      const transactionService = new TransactionService();

      const updated = await transactionService.updateTransaction(first.id, ctx.buildRequest(tab.user.id));
      expect(updated).to.not.be.undefined;
      await transactionService.deleteTransaction(second.id);
      expect((await new TabService().getOutstanding(tab)).getAmount()).to.equal(ctx.price);
    });

    it('should refuse a purchase that was validated before the payment started', async () => {
      const tab = await openTab();
      await sell(tab);
      const transactionService = new TransactionService();
      const req = ctx.buildRequest(tab.user.id);
      const { valid, context } = await transactionService.verifyTransaction(req);
      expect(valid).to.be.true;

      await pay(tab);
      await expectRejection(transactionService.createTransaction(req, context!), LockedTabTransactionError);
      expect((await new TabService().getOutstanding(tab)).getAmount()).to.equal(ctx.price);
    });

    it('should reopen the tab when the reader has no action left to cancel', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await pay(tab);
      cancelActionStub.rejects(new Error('Reader has no action'));

      const reopened = await service.cancelPayment(tab.id);
      expect(reopened.status).to.equal(TabStatus.OPEN);
    });

    it('should keep the tab locked when the payment can no longer be cancelled', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await pay(tab);
      cancelIntentStub.rejects(Object.assign(new Error('Unexpected state'), { payment_intent: { status: 'succeeded' } }));

      await expectRejection(service.cancelPayment(tab.id), TabStateError);
      expect((await service.getTab(tab.id))!.status).to.equal(TabStatus.LOCKED);
    });

    it('should treat an intent that Stripe already cancelled as cancelled', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await pay(tab);
      cancelIntentStub.rejects(Object.assign(new Error('Unexpected state'), { payment_intent: { status: 'canceled' } }));

      expect((await service.cancelPayment(tab.id)).status).to.equal(TabStatus.OPEN);
    });

    it('should credit a late payment but leave an invoiced tab as it is', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      // The payment is cancelled, but Stripe still reports it succeeded later.
      const intent = await pay(tab);
      await service.cancelPayment(tab.id);
      await service.convertToInvoiceAccount(tab.id, ctx.admin);

      await new StripeWebhookService().createNewPaymentIntentStatus(intent.id, StripePaymentIntentState.SUCCEEDED);
      const after = (await service.getTab(tab.id))!;
      expect(after.status).to.equal(TabStatus.INVOICED);
      expect(after.transfer).to.be.null;
      const user = await User.findOne({ where: { id: tab.user.id } });
      expect(user!.type).to.equal(UserType.INVOICE);
      expect(user!.active).to.be.true;
      // The card was charged, so the credit is kept.
      expect((await new BalanceService().getBalance(tab.user.id)).amount.amount).to.equal(0);
    });
  });

  describe('updateTab', () => {
    it('should keep the tab user in sync with the tab', async () => {
      const tab = await openTab();
      const updated = await new TabService().updateTab(tab.id, { name: 'Renamed', contactEmail: 'new@example.com' });
      expect(updated.name).to.equal('Renamed');
      expect(updated.contactEmail).to.equal('new@example.com');
      const user = await User.findOne({ where: { id: tab.user.id } });
      expect(user!.firstName).to.equal('Renamed');
      expect(user!.email).to.equal('new@example.com');
    });

    it('should not update a tab that is being paid', async () => {
      const tab = await openTab();
      await sell(tab);
      await pay(tab);
      await expectRejection(new TabService().updateTab(tab.id, { name: 'Renamed' }), TabStateError);
    });
  });

  describe('getTabs', () => {
    it('should filter on status and report the outstanding amount and reader', async () => {
      const open = await openTab('Open tab');
      await sell(open);
      const locked = await openTab('Locked tab');
      await sell(locked);
      await sell(locked);
      await pay(locked);
      const service = new TabService();

      const [lockedTabs] = await service.getTabs({ status: TabStatus.LOCKED });
      expect(lockedTabs.map((t) => t.id)).to.include(locked.id);
      expect(lockedTabs.map((t) => t.id)).to.not.include(open.id);
      lockedTabs.forEach((t) => expect(t.status).to.equal(TabStatus.LOCKED));

      const [openTabs] = await service.getTabs({ status: TabStatus.OPEN });
      expect(openTabs.map((t) => t.id)).to.include(open.id);
      expect(openTabs.map((t) => t.id)).to.not.include(locked.id);

      const responses = await service.toResponses([open, (await service.getTab(locked.id))!]);
      expect(responses[0].outstanding.amount).to.equal(ctx.price);
      expect(responses[0].processedByTerminal).to.be.undefined;
      expect(responses[1].outstanding.amount).to.equal(2 * ctx.price);
      expect(responses[1].processedByTerminal).to.equal(FAKE_READER_ID);
    });
  });

  describe('cancelTab', () => {
    it('should cancel a tab without purchases', async () => {
      const tab = await openTab();
      const cancelled = await new TabService().cancelTab(tab.id);
      expect(cancelled.status).to.equal(TabStatus.CANCELLED);
    });

    it('should not cancel a tab with purchases', async () => {
      const tab = await openTab();
      await sell(tab);
      await expectRejection(new TabService().cancelTab(tab.id), TabStateError);
    });
  });

  describe('convertToInvoiceAccount', () => {
    // Entered on the invoice, since the invoice account has no default address.
    const invoiceAddress = {
      street: 'Groene Loper 5', postalCode: '5612 AE', city: 'Eindhoven', country: 'Netherlands',
    };

    it('should turn the tab user into an invoice account that can be invoiced', async () => {
      const tab = await openTab();
      const t1 = await sell(tab);
      const t2 = await sell(tab);
      const service = new TabService();

      const invoiced = await service.convertToInvoiceAccount(tab.id, ctx.admin);
      expect(invoiced.status).to.equal(TabStatus.INVOICED);
      const user = await User.findOne({ where: { id: tab.user.id } });
      expect(user!.type).to.equal(UserType.INVOICE);
      const invoiceUser = await InvoiceUser.findOne({ where: { userId: tab.user.id } });
      expect(invoiceUser).to.not.be.null;
      expect(invoiceUser!.automatic).to.be.false;
      expect(invoiceUser!.street).to.equal('');

      // No new purchases on an invoiced tab.
      const { valid } = await new TransactionService().verifyTransaction(ctx.buildRequest(tab.user.id));
      expect(valid).to.be.false;

      const outstanding = await service.getOutstanding(tab);
      await new InvoiceService().createInvoice({
        forId: tab.user.id,
        byId: ctx.admin.id,
        transactionIDs: [t1.id, t2.id],
        amount: outstanding.toObject(),
        addressee: tab.contactName,
        description: tab.name,
        reference: `TAB-${tab.id}`,
        date: new Date(),
        ...invoiceAddress,
      });
      const balance = await new BalanceService().getBalance(tab.user.id);
      expect(balance.amount.amount).to.equal(0);
    });

    it('should not convert a tab that is being paid', async () => {
      const tab = await openTab();
      await sell(tab);
      const service = new TabService();
      await pay(tab);
      await expectRejection(service.convertToInvoiceAccount(tab.id, ctx.admin), TabStateError);
    });
  });
});
