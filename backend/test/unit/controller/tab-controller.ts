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
import { json } from 'body-parser';
import chai from 'chai';
import express, { Application } from 'express';
import { DataSource } from 'typeorm';
import sinon from 'sinon';
import Stripe from 'stripe';
import TokenHandler from '../../../src/authentication/token-handler';
import TabController from '../../../src/controller/tab-controller';
import TransactionController from '../../../src/controller/transaction-controller';
import { TabResponse } from '../../../src/controller/response/tab-response';
import { TransactionRequest } from '../../../src/controller/request/transaction-request';
import { STRIPE_API_VERSION } from '../../../src/service/stripe-service';
import TabService from '../../../src/service/tab-service';
import TransactionService from '../../../src/service/transaction-service';
import Database from '../../../src/database/database';
import Tab, { TabStatus } from '../../../src/entity/tab/tab';
import User, { UserType } from '../../../src/entity/user/user';
import PointOfSale from '../../../src/entity/point-of-sale/point-of-sale';
import PointOfSaleRevision from '../../../src/entity/point-of-sale/point-of-sale-revision';
import Transaction from '../../../src/entity/transactions/transaction';
import Config from '../../../src/config';
import TokenMiddleware from '../../../src/middleware/token-middleware';
import RoleManager from '../../../src/rbac/role-manager';
import Swagger from '../../../src/start/swagger';
import StripeWebhookService from '../../../src/service/stripe-webhook-service';
import { StripePaymentIntentState } from '../../../src/entity/stripe/stripe-payment-intent-status';
import TabPaymentAttempt from '../../../src/entity/tab/tab-payment-attempt';
import { PdfCompiler } from '../../../src/service/pdf/pdf-service';
import Mailer from '../../../src/mailer';
import { TAB_RECEIPT_PDF_LOCATION } from '../../../src/files/storage';
import WebSocketService from '../../../src/service/websocket-service';
import ServerSettingsStore from '../../../src/server-settings/server-settings-store';
import { truncateAllTables } from '../../helpers/database-helpers';
import { finishTestDB } from '../../helpers/test-helpers';
import { ensureProductionRoles, signTokenFor } from '../../helpers/user-factory';
import { TerminalPaymentSeeder } from '../../seed';

const { expect, request } = chai;

const FAKE_PAYMENT_INTENT = 'fake_tab_controller_intent_do_not_use';
const FAKE_READER_ID = 'fake_tab_controller_reader_do_not_use';
const STRIPE_ENV = ['STRIPE_PUBLIC_KEY', 'STRIPE_PRIVATE_KEY', 'STRIPE_RETURN_URL', 'STRIPE_WEBHOOK_SECRET'];

describe('TabController', () => {
  let ctx: {
    connection: DataSource;
    app: Application;
    admin: User;
    adminToken: string;
    memberToken: string;
    posToken: string;
    setPosLogin: (useAuthentication: boolean) => Promise<unknown>;
    buildRequest: (fromId: number) => TransactionRequest;
  };

  const originalEnv: Record<string, string | undefined> = {};
  let intentCounter = 0;
  let processIntentStub: sinon.SinonStub;
  let cancelIntentStub: sinon.SinonStub;
  let listReadersStub: sinon.SinonStub;

  beforeAll(async () => {
    STRIPE_ENV.forEach((k) => {
      originalEnv[k] = process.env[k];
      process.env[k] = process.env[k] || `test_${k.toLowerCase()}`;
    });
    Config.reset();

    const connection = await Database.initialize();
    await truncateAllTables(connection);
    await ServerSettingsStore.getInstance().initialize();

    const admin = await User.save({
      firstName: 'Admin', type: UserType.LOCAL_ADMIN, active: true, tosRequired: false,
    } as User);
    const member = await User.save({
      firstName: 'Member', type: UserType.LOCAL_USER, active: true, tosRequired: false,
    } as User);

    const { catalogue } = await new TerminalPaymentSeeder().seed([admin]);
    const { products, containers, pointOfSale } = catalogue!;
    const product = products.grimbergenRevision;
    const price = product.priceInclVat.toObject();
    const bar = await PointOfSale.findOne({ where: { id: pointOfSale.bar.id }, relations: { user: true } });

    const setPosLogin = (useAuthentication: boolean) => PointOfSaleRevision.update(
      { pointOfSaleId: pointOfSale.bar.id, revision: pointOfSale.barRevision.revision },
      { useAuthentication },
    );
    await setPosLogin(false);

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

    const tokenHandler = new TokenHandler({
      algorithm: 'HS256', publicKey: 'test', privateKey: 'test', expiry: 3600,
    });
    const app = express();
    const specification = await Swagger.initialize(app);
    await ensureProductionRoles();
    const roleManager = await new RoleManager().initialize();

    app.use(json());
    app.use(new TokenMiddleware({ tokenHandler, refreshFactor: 0.5 }).getMiddleware());
    app.use('/tabs', new TabController({ specification, roleManager }).getRouter());
    app.use('/transactions', new TransactionController({ specification, roleManager }).getRouter());

    ctx = {
      connection,
      app,
      admin,
      adminToken: await signTokenFor(admin, tokenHandler, 'nonce admin'),
      memberToken: await signTokenFor(member, tokenHandler, 'nonce member'),
      posToken: await signTokenFor(bar!.user, tokenHandler, 'nonce pos'),
      setPosLogin,
      buildRequest,
    };
  });

  afterAll(async () => {
    STRIPE_ENV.forEach((k) => {
      if (originalEnv[k] === undefined) delete process.env[k];
      else process.env[k] = originalEnv[k];
    });
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
      .resolves({ data: [{ id: FAKE_READER_ID, label: 'Bar', status: 'online', action: null }] } as any);
    processIntentStub = sinon.stub(Object.getPrototypeOf(sampleStripe.terminal.readers), 'processPaymentIntent')
      .resolves({ id: FAKE_READER_ID } as any);
    sinon.stub(Object.getPrototypeOf(sampleStripe.terminal.readers), 'cancelAction')
      .resolves({ id: FAKE_READER_ID } as any);
    // No WebSocket server runs in these tests.
    sinon.stub(WebSocketService, 'emitTabUpdated').resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  async function openTab(): Promise<Tab> {
    return new TabService().createTab({
      name: 'Borrel group', contactName: 'Contact Person', contactEmail: 'contact@example.com', ofAge: true,
    }, ctx.admin);
  }

  async function sell(tab: Tab): Promise<Transaction> {
    const service = new TransactionService();
    const req = ctx.buildRequest(tab.user.id);
    const { context } = await service.verifyTransaction(req);
    return service.createTransaction(req, context!);
  }

  /** A tab paid through the real webhook path. */
  async function paidTab(): Promise<Tab> {
    const tab = await openTab();
    await sell(tab);
    await new TabService().startPayment(tab.id, FAKE_READER_ID);
    const attempt = await TabPaymentAttempt.findOne({ where: { tabId: tab.id }, order: { paymentIntentId: 'DESC' } });
    await new StripeWebhookService()
      .createNewPaymentIntentStatus(attempt!.paymentIntentId, StripePaymentIntentState.SUCCEEDED);
    return (await new TabService().getTab(tab.id))!;
  }

  const validTab = {
    name: 'Borrel group', contactName: 'Contact Person', contactEmail: 'contact@example.com', ofAge: true,
  };

  describe('GET /tabs', () => {
    it('should give an HTTP 403 for a member', async () => {
      const res = await request(ctx.app).get('/tabs').set('Authorization', `Bearer ${ctx.memberToken}`);
      expect(res.status).to.equal(403);
    });

    it('should give an HTTP 400 for an unknown status', async () => {
      const res = await request(ctx.app).get('/tabs?status=NOPE').set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(400);
    });

    it('should return only tabs with the given status', async () => {
      const open = await openTab();
      const cancelled = await openTab();
      await new TabService().cancelTab(cancelled.id);

      const res = await request(ctx.app).get('/tabs?status=OPEN').set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(200);
      const ids = (res.body.records as TabResponse[]).map((t) => t.id);
      expect(ids).to.include(open.id);
      expect(ids).to.not.include(cancelled.id);
    });
  });

  describe('POST /tabs', () => {
    it('should give an HTTP 400 when a field is missing or blank', async () => {
      const res = await request(ctx.app).post('/tabs').set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ ...validTab, contactName: '   ' });
      expect(res.status).to.equal(400);
    });

    it('should trim the name and contact name', async () => {
      const res = await request(ctx.app).post('/tabs').set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ ...validTab, name: '  Spaced  ', contactName: ' Contact ' });
      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal('Spaced');
      expect(res.body.contactName).to.equal('Contact');
    });

    it('should give an HTTP 403 for a member', async () => {
      const res = await request(ctx.app).post('/tabs').set('Authorization', `Bearer ${ctx.memberToken}`)
        .send(validTab);
      expect(res.status).to.equal(403);
    });

    it('should only open a tab at a point of sale in borrel mode', async () => {
      await ctx.setPosLogin(true);
      try {
        const res = await request(ctx.app).post('/tabs').set('Authorization', `Bearer ${ctx.posToken}`)
          .send(validTab);
        expect(res.status).to.equal(403);
      } finally {
        await ctx.setPosLogin(false);
      }

      const res = await request(ctx.app).post('/tabs').set('Authorization', `Bearer ${ctx.posToken}`)
        .send(validTab);
      expect(res.status).to.equal(200);
      expect((WebSocketService.emitTabUpdated as sinon.SinonStub).calledOnce).to.be.true;
    });
  });

  describe('GET /tabs/:id', () => {
    it('should return the tab with its outstanding amount', async () => {
      const tab = await openTab();
      await sell(tab);
      const res = await request(ctx.app).get(`/tabs/${tab.id}`).set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.id).to.equal(tab.id);
      expect(res.body.status).to.equal(TabStatus.OPEN);
      expect(res.body.outstanding.amount).to.be.greaterThan(0);
    });

    it('should give an HTTP 404 for an unknown tab', async () => {
      const res = await request(ctx.app).get('/tabs/999999').set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(404);
    });

    it('should give an HTTP 403 for a member', async () => {
      const tab = await openTab();
      const res = await request(ctx.app).get(`/tabs/${tab.id}`).set('Authorization', `Bearer ${ctx.memberToken}`);
      expect(res.status).to.equal(403);
    });
  });

  describe('DELETE /tabs/:id', () => {
    it('should cancel a tab without purchases', async () => {
      const tab = await openTab();
      const res = await request(ctx.app).delete(`/tabs/${tab.id}`).set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal(TabStatus.CANCELLED);
      expect((WebSocketService.emitTabUpdated as sinon.SinonStub).calledOnce).to.be.true;
    });

    it('should give an HTTP 409 for a tab with purchases', async () => {
      const tab = await openTab();
      await sell(tab);
      const res = await request(ctx.app).delete(`/tabs/${tab.id}`).set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(409);
    });
  });

  describe('PATCH /tabs/:id', () => {
    it('should give an HTTP 400 when nothing is updated', async () => {
      const tab = await openTab();
      const res = await request(ctx.app).patch(`/tabs/${tab.id}`).set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({});
      expect(res.status).to.equal(400);
    });

    it('should give an HTTP 404 for an unknown tab', async () => {
      const res = await request(ctx.app).patch('/tabs/999999').set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ name: 'Renamed' });
      expect(res.status).to.equal(404);
    });

    it('should update the tab and tell its subscribers', async () => {
      const tab = await openTab();
      const res = await request(ctx.app).patch(`/tabs/${tab.id}`).set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ name: 'Renamed' });
      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal('Renamed');
      expect((WebSocketService.emitTabUpdated as sinon.SinonStub).calledOnce).to.be.true;
    });
  });

  describe('POST /tabs/:id/payment', () => {
    it('should only pay at a point of sale in borrel mode', async () => {
      const tab = await openTab();
      await sell(tab);
      await ctx.setPosLogin(true);
      try {
        const res = await request(ctx.app).post(`/tabs/${tab.id}/payment`).set('Authorization', `Bearer ${ctx.posToken}`)
          .send({ stripeTerminalId: FAKE_READER_ID });
        expect(res.status).to.equal(403);
      } finally {
        await ctx.setPosLogin(false);
      }
      expect((await new TabService().getTab(tab.id))!.status).to.equal(TabStatus.OPEN);
    });

    it('should give an HTTP 422 when the reader is busy', async () => {
      const tab = await openTab();
      await sell(tab);
      listReadersStub.resolves({
        data: [{
          id: FAKE_READER_ID, label: 'Bar', status: 'online', action: { status: 'in_progress' },
        }],
      } as any);

      const res = await request(ctx.app).post(`/tabs/${tab.id}/payment`).set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ stripeTerminalId: FAKE_READER_ID });
      expect(res.status).to.equal(422);
      expect(processIntentStub.called).to.be.false;
    });

    it('should give an HTTP 400 for an unknown reader', async () => {
      const tab = await openTab();
      await sell(tab);
      const res = await request(ctx.app).post(`/tabs/${tab.id}/payment`).set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ stripeTerminalId: 'unknown_reader' });
      expect(res.status).to.equal(400);
    });

    it('should lock the tab, and give an HTTP 409 for a second payment', async () => {
      const tab = await openTab();
      await sell(tab);
      let res = await request(ctx.app).post(`/tabs/${tab.id}/payment`).set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ stripeTerminalId: FAKE_READER_ID });
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal(TabStatus.LOCKED);
      expect(res.body.processedByTerminal).to.equal(FAKE_READER_ID);
      expect(processIntentStub.calledOnce).to.be.true;

      res = await request(ctx.app).post(`/tabs/${tab.id}/payment`).set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ stripeTerminalId: FAKE_READER_ID });
      expect(res.status).to.equal(409);
    });

    it('should give an HTTP 502 and reopen the tab when the reader refuses', async () => {
      const tab = await openTab();
      await sell(tab);
      processIntentStub.rejects(new Error('Reader offline'));

      const res = await request(ctx.app).post(`/tabs/${tab.id}/payment`).set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ stripeTerminalId: FAKE_READER_ID });
      expect(res.status).to.equal(502);
      expect(res.body).to.contain('open again');
      expect((await new TabService().getTab(tab.id))!.status).to.equal(TabStatus.OPEN);
    });

    it('should give an HTTP 409 and keep the tab locked when the reader refuses and cancelling fails', async () => {
      const tab = await openTab();
      await sell(tab);
      processIntentStub.rejects(new Error('Reader offline'));
      cancelIntentStub.rejects(Object.assign(new Error('Unexpected state'), { payment_intent: { status: 'succeeded' } }));

      const res = await request(ctx.app).post(`/tabs/${tab.id}/payment`).set('Authorization', `Bearer ${ctx.adminToken}`)
        .send({ stripeTerminalId: FAKE_READER_ID });
      expect(res.status).to.equal(409);
      expect((await new TabService().getTab(tab.id))!.status).to.equal(TabStatus.LOCKED);
    });
  });

  describe('DELETE /tabs/:id/payment', () => {
    it('should give an HTTP 409 when the payment can no longer be cancelled', async () => {
      const tab = await openTab();
      await sell(tab);
      await new TabService().startPayment(tab.id, FAKE_READER_ID);
      cancelIntentStub.rejects(Object.assign(new Error('Unexpected state'), { payment_intent: { status: 'succeeded' } }));

      const res = await request(ctx.app).delete(`/tabs/${tab.id}/payment`).set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(409);
      expect((await new TabService().getTab(tab.id))!.status).to.equal(TabStatus.LOCKED);
    });
  });

  describe('GET /tabs/:id/receipt', () => {
    it('should give an HTTP 409 for a tab that is not paid', async () => {
      const tab = await openTab();
      const res = await request(ctx.app).get(`/tabs/${tab.id}/receipt`).set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(409);
    });
  });

  describe('POST /tabs/:id/receipt/send', () => {
    it('should give an HTTP 409 for a tab that is not paid', async () => {
      const tab = await openTab();
      const res = await request(ctx.app).post(`/tabs/${tab.id}/receipt/send`).set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(409);
    });

    it('should email the receipt of a paid tab', async () => {
      const tab = await paidTab();
      fs.mkdirSync(TAB_RECEIPT_PDF_LOCATION, { recursive: true });
      sinon.stub(PdfCompiler, 'compile').resolves(Buffer.from('PDF content'));
      const sendStub = sinon.stub().resolves();
      sinon.stub(Mailer, 'getInstance').returns({ send: sendStub } as any);

      const res = await request(ctx.app).post(`/tabs/${tab.id}/receipt/send`).set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(204);
      expect(sendStub.calledOnce).to.be.true;
      expect(sendStub.firstCall.args[0].email).to.equal('contact@example.com');
    });

    it('should give an HTTP 403 for a member', async () => {
      const tab = await openTab();
      const res = await request(ctx.app).post(`/tabs/${tab.id}/receipt/send`).set('Authorization', `Bearer ${ctx.memberToken}`);
      expect(res.status).to.equal(403);
    });
  });

  describe('POST /tabs/:id/convert-to-invoice-account', () => {
    it('should convert a tab with purchases without any invoice details', async () => {
      const tab = await openTab();
      await sell(tab);
      const res = await request(ctx.app).post(`/tabs/${tab.id}/convert-to-invoice-account`)
        .set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(200);
      expect((res.body as TabResponse).status).to.equal(TabStatus.INVOICED);
    });

    it('should give an HTTP 409 for a tab without purchases', async () => {
      const tab = await openTab();
      const res = await request(ctx.app).post(`/tabs/${tab.id}/convert-to-invoice-account`)
        .set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(409);
    });

    it('should give an HTTP 403 for a member', async () => {
      const tab = await openTab();
      await sell(tab);
      const res = await request(ctx.app).post(`/tabs/${tab.id}/convert-to-invoice-account`)
        .set('Authorization', `Bearer ${ctx.memberToken}`);
      expect(res.status).to.equal(403);
    });
  });

  describe('PATCH /transactions/:id', () => {
    it('should give an HTTP 409 for a transaction on a tab that is being paid', async () => {
      const tab = await openTab();
      const transaction = await sell(tab);
      await new TabService().startPayment(tab.id, FAKE_READER_ID);

      const res = await request(ctx.app).patch(`/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${ctx.adminToken}`)
        .send(ctx.buildRequest(tab.user.id));
      expect(res.status).to.equal(409);
    });

    it('should give an HTTP 409 for a transaction on a paid tab', async () => {
      const tab = await paidTab();
      const [transaction] = await Transaction.find({ where: { from: { id: tab.user.id } } });

      const res = await request(ctx.app).patch(`/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${ctx.adminToken}`)
        .send(ctx.buildRequest(tab.user.id));
      expect(res.status).to.equal(409);
      expect(res.body).to.equal('Transaction was paid by card terminal and cannot be modified.');
    });
  });

  describe('GET /transactions/:id', () => {
    it('should report a transaction on a paid tab as paid by card terminal', async () => {
      const tab = await paidTab();
      const [transaction] = await Transaction.find({ where: { from: { id: tab.user.id } } });

      const res = await request(ctx.app).get(`/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.paidByTerminal).to.be.true;
    });
  });

  describe('DELETE /transactions/:id', () => {
    it('should give an HTTP 409 for a transaction on a tab that is being paid', async () => {
      const tab = await openTab();
      const transaction = await sell(tab);
      await new TabService().startPayment(tab.id, FAKE_READER_ID);

      const res = await request(ctx.app).delete(`/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(409);
      expect(await Transaction.findOne({ where: { id: transaction.id } })).to.not.be.null;
    });

    it('should give an HTTP 409 for a transaction on a paid tab', async () => {
      const tab = await paidTab();
      const [transaction] = await Transaction.find({ where: { from: { id: tab.user.id } } });

      const res = await request(ctx.app).delete(`/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${ctx.adminToken}`);
      expect(res.status).to.equal(409);
      expect(res.body).to.equal('Transaction was paid by card terminal and cannot be modified.');
      expect(await Transaction.findOne({ where: { id: transaction.id } })).to.not.be.null;
    });
  });
});
