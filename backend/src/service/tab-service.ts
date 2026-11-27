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

/**
 * This is the module page of the tab service.
 *
 * @module tabs
 */

import {
  EntityManager, FindOptionsWhere, In, IsNull, Not,
} from 'typeorm';
import DineroFactory, { Dinero } from 'dinero.js';
import log4js, { Logger } from 'log4js';
import WithManager from '../database/with-manager';
import { writeLock } from '../database/row-lock';
import Tab, { TabStatus } from '../entity/tab/tab';
import TabPaymentAttempt from '../entity/tab/tab-payment-attempt';
import User, { UserType } from '../entity/user/user';
import InvoiceUser from '../entity/user/invoice-user';
import StripePaymentIntent from '../entity/stripe/stripe-payment-intent';
import StripeDeposit from '../entity/stripe/stripe-deposit';
import StripeService from './stripe-service';
import BalanceService from './balance-service';
import FileService from './file-service';
import TabReceiptPdfService from './pdf/tab-receipt-pdf-service';
import Mailer from '../mailer';
import TabReceipt from '../mailer/messages/tab-receipt';
import { Language } from '../mailer/mail-message';
import { CreateTabRequest, UpdateTabRequest } from '../controller/request/tab-request';
import { TabResponse } from '../controller/response/tab-response';
import { parseUserToBaseResponse } from '../helpers/revision-to-response';
import { TAB_RECEIPT_PDF_LOCATION } from '../files/storage';
import { applyConfiguredLogLevel } from '../helpers/logging';
import { PaginationParameters } from '../helpers/pagination';

/**
 * Thrown when an action is not allowed in the tab's current state, for
 * example paying a tab that is already paid.
 */
export class TabStateError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TabStateError';
  }
}

/**
 * Thrown when the tab to change does not exist.
 */
export class TabNotFoundError extends Error {
  public constructor(id: number) {
    super(`Tab with ID "${id}" not found.`);
    this.name = 'TabNotFoundError';
  }
}

/**
 * Thrown when the Stripe Terminal to pay a tab on does not exist.
 */
export class TerminalNotFoundError extends Error {
  public constructor(id: string) {
    super(`Stripe Terminal with ID "${id}" not found.`);
    this.name = 'TerminalNotFoundError';
  }
}

/**
 * Thrown when the Stripe Terminal to pay a tab on is busy with another
 * payment. Starting a payment on a busy reader silently replaces the payment
 * it is collecting.
 */
export class TerminalUnavailableError extends Error {
  public constructor(id: string) {
    super(`Stripe Terminal with ID "${id}" is busy with another payment.`);
    this.name = 'TerminalUnavailableError';
  }
}

/**
 * The status that Stripe reports for the payment intent in an error, if any.
 */
function intentStatusOf(error: unknown): string | undefined {
  return (error as { payment_intent?: { status?: string } })?.payment_intent?.status;
}

export interface TabFilterParameters {
  status?: TabStatus;
}

/**
 * The `where` clause that selects the tabs with the given derived status.
 * Mirrors the precedence in {@link Tab.status}.
 */
function whereStatus(status: TabStatus): FindOptionsWhere<Tab> {
  switch (status) {
    case TabStatus.PAID:
      return { paidAt: Not(IsNull()) };
    case TabStatus.INVOICED:
      return { paidAt: IsNull(), invoicedAt: Not(IsNull()) };
    case TabStatus.CANCELLED:
      return { paidAt: IsNull(), invoicedAt: IsNull(), cancelledAt: Not(IsNull()) };
    case TabStatus.LOCKED:
      return { paidAt: IsNull(), invoicedAt: IsNull(), cancelledAt: IsNull(), lockedAt: Not(IsNull()) };
    case TabStatus.OPEN:
    default:
      return { paidAt: IsNull(), invoicedAt: IsNull(), cancelledAt: IsNull(), lockedAt: IsNull() };
  }
}

export default class TabService extends WithManager {
  private logger: Logger = log4js.getLogger('TabService');

  constructor(manager?: EntityManager) {
    super(manager);
    applyConfiguredLogLevel(this.logger);
  }

  /**
   * Convert a tab to its API response.
   * @param tab - The tab, with `createdBy` loaded.
   * @param outstanding - The amount that still has to be paid.
   * @param processedByTerminal - The reader handling the current payment, if any.
   */
  public static asTabResponse(tab: Tab, outstanding: Dinero, processedByTerminal?: string): TabResponse {
    return {
      id: tab.id,
      createdAt: tab.createdAt.toISOString(),
      updatedAt: tab.updatedAt.toISOString(),
      version: tab.version,
      name: tab.name,
      contactName: tab.contactName,
      contactEmail: tab.contactEmail,
      status: tab.status,
      user: parseUserToBaseResponse(tab.user, false),
      createdBy: parseUserToBaseResponse(tab.createdBy, false),
      outstanding: outstanding.toObject(),
      paidAt: tab.paidAt?.toISOString(),
      invoicedAt: tab.invoicedAt?.toISOString(),
      cancelledAt: tab.cancelledAt?.toISOString(),
      processedByTerminal: tab.status === TabStatus.LOCKED ? processedByTerminal : undefined,
    };
  }

  /**
   * Build the response for a tab, looking up its outstanding amount and the
   * reader handling its current payment.
   */
  public async toResponse(tab: Tab): Promise<TabResponse> {
    return (await this.toResponses([tab]))[0];
  }

  /**
   * Build the responses for many tabs, looking up their balances and the
   * readers handling their payments in one query each.
   */
  public async toResponses(tabs: Tab[]): Promise<TabResponse[]> {
    if (tabs.length === 0) return [];

    const [balances] = await new BalanceService(this.manager)
      .getBalances({ ids: tabs.map((t) => t.user.id), allowDeleted: true });
    const balanceByUser = new Map(balances.map((b) => [b.id, b.amount?.amount ?? 0]));

    const lockedIds = tabs.filter((t) => t.status === TabStatus.LOCKED).map((t) => t.id);
    const terminalByTab = new Map<number, string>();
    if (lockedIds.length > 0) {
      const attempts = await this.manager.find(TabPaymentAttempt, {
        where: { tabId: In(lockedIds) },
        order: { paymentIntentId: 'DESC' },
      });
      attempts.forEach((a) => {
        if (!terminalByTab.has(a.tabId)) terminalByTab.set(a.tabId, a.processedByTerminal);
      });
    }

    return tabs.map((t) => TabService.asTabResponse(
      t, TabService.asOutstanding(balanceByUser.get(t.user.id) ?? 0), terminalByTab.get(t.id),
    ));
  }

  /**
   * The amount owed for a tab user with the given balance: the negated
   * balance, never below zero.
   */
  private static asOutstanding(balance: number): Dinero {
    return DineroFactory({ amount: Math.max(0, -balance) });
  }

  /**
   * The amount the group still owes: the negated balance of the tab user,
   * never below zero.
   */
  public async getOutstanding(tab: Tab): Promise<Dinero> {
    const balance = await new BalanceService(this.manager).getBalance(tab.user.id);
    return TabService.asOutstanding(balance?.amount?.amount ?? 0);
  }

  public async getTabs(
    { status }: TabFilterParameters = {}, { take, skip }: PaginationParameters = {},
  ): Promise<[Tab[], number]> {
    return this.manager.findAndCount(Tab, {
      where: status ? whereStatus(status) : undefined,
      relations: { createdBy: true },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
  }

  public async getTab(id: number): Promise<Tab | null> {
    return this.manager.findOne(Tab, {
      where: { id },
      relations: { createdBy: true, transfer: true },
    });
  }

  /**
   * Find the tab whose internal user has the given ID.
   */
  public async getTabByUserId(userId: number): Promise<Tab | null> {
    return this.manager.findOne(Tab, {
      where: { user: { id: userId } },
      relations: { createdBy: true, transfer: true },
    });
  }

  /**
   * Find the tab that the given Stripe payment intent was an attempt to pay.
   * @param paymentIntentId - Database ID of the {@link StripePaymentIntent}.
   */
  public async getTabByPaymentIntentId(paymentIntentId: number): Promise<Tab | null> {
    const attempt = await this.manager.findOne(TabPaymentAttempt, {
      where: { paymentIntentId },
      relations: { tab: { createdBy: true, transfer: true } },
    });
    return attempt?.tab ?? null;
  }

  /**
   * The newest payment attempt of the tab. Ordered by the auto-increment ID
   * of its intent, because attempts made within the same second have equal
   * creation times.
   */
  private async getLatestAttempt(tab: Tab): Promise<TabPaymentAttempt | null> {
    return this.manager.findOne(TabPaymentAttempt, {
      where: { tabId: tab.id },
      relations: { paymentIntent: true },
      order: { paymentIntentId: 'DESC' },
    });
  }

  /**
   * Get the tab to change it, or throw a {@link TabNotFoundError}. Inside a transaction, the tab row is locked
   * first, so a change and a purchase on the same tab (which locks it too, see
   * {@link TransactionService.createTransaction}) never interleave.
   */
  private async getTabOrFail(id: number): Promise<Tab> {
    const lock = writeLock(this.manager);
    if (lock) await this.manager.findOne(Tab, { where: { id }, select: { id: true }, lock, loadEagerRelations: false });

    const tab = await this.getTab(id);
    if (!tab) throw new TabNotFoundError(id);
    return tab;
  }

  private static assertStatus(tab: Tab, ...allowed: TabStatus[]) {
    if (!allowed.includes(tab.status)) {
      throw new TabStateError(`Tab has status "${tab.status}", but expected one of "${allowed.join('", "')}".`);
    }
  }

  /**
   * Open a new tab. Creates the internal `TAB` user that the point of sale
   * sells to. The user cannot log in, so no welcome email is sent.
   * @param params - The tab details.
   * @param createdBy - The user that opens the tab.
   */
  public async createTab(params: CreateTabRequest, createdBy: User): Promise<Tab> {
    const user = await this.manager.save(User, Object.assign(new User(), {
      firstName: params.name,
      lastName: '',
      email: params.contactEmail,
      type: UserType.TAB,
      active: true,
      canGoIntoDebt: true,
      ofAge: params.ofAge,
      tosRequired: false,
    }));

    const tab = await this.manager.save(Tab, Object.assign(new Tab(), {
      name: params.name,
      contactName: params.contactName,
      contactEmail: params.contactEmail,
      user,
      createdBy,
    }));
    return (await this.getTab(tab.id))!;
  }

  /**
   * Change the name or contact details of an open tab. The tab user is kept in
   * sync, because the point of sale shows its name and the mailer uses its
   * email address.
   */
  public async updateTab(id: number, params: UpdateTabRequest): Promise<Tab> {
    const tab = await this.getTabOrFail(id);
    TabService.assertStatus(tab, TabStatus.OPEN);

    if (params.name !== undefined) {
      tab.name = params.name;
      tab.user.firstName = params.name;
    }
    if (params.contactName !== undefined) tab.contactName = params.contactName;
    if (params.contactEmail !== undefined) {
      tab.contactEmail = params.contactEmail;
      tab.user.email = params.contactEmail;
    }

    await this.manager.save(User, tab.user);
    await this.manager.save(Tab, tab);
    return (await this.getTab(id))!;
  }

  /**
   * Close the tab user so nothing more can be sold to it. The user is kept
   * (not deleted) so its transactions keep their buyer.
   */
  private async closeTabUser(user: User) {
    Object.assign(user, { active: false, canGoIntoDebt: false });
    await this.manager.save(User, user);
  }

  /**
   * Cancel an open tab that nothing was bought on.
   */
  public async cancelTab(id: number): Promise<Tab> {
    const tab = await this.getTabOrFail(id);
    TabService.assertStatus(tab, TabStatus.OPEN);

    const balance = await new BalanceService(this.manager).getBalance(tab.user.id);
    if ((balance?.amount?.amount ?? 0) !== 0) {
      throw new TabStateError('Only a tab with a zero balance can be cancelled.');
    }

    tab.cancelledAt = new Date();
    await this.manager.save(Tab, tab);
    await this.closeTabUser(tab.user);
    return tab;
  }

  /**
   * Start paying the outstanding amount of the tab on a Stripe Terminal:
   * create the payment intent and lock the tab, so the ledger cannot change
   * while the card reader is collecting. Run this in a transaction, and only
   * after it committed tell the reader to collect with
   * {@link collectOnTerminal}. That way the reader never collects a payment
   * that SudoSOS has no record of.
   * @param id - ID of the tab.
   * @param stripeTerminalId - ID of the reader to pay on.
   * @throws {TerminalNotFoundError} when the reader does not exist.
   * @throws {TerminalUnavailableError} when the reader is busy with another payment.
   */
  public async startPayment(id: number, stripeTerminalId: string): Promise<Tab> {
    // Locks the tab row, so purchases still being rung up finish first and
    // count in the outstanding amount, and a second start waits and then
    // finds the tab locked.
    const tab = await this.getTabOrFail(id);
    TabService.assertStatus(tab, TabStatus.OPEN);

    const outstanding = await this.getOutstanding(tab);
    if (outstanding.isZero()) {
      throw new TabStateError('Tab has nothing to pay.');
    }

    const stripeService = new StripeService(this.manager);
    const terminal = await stripeService.getSingleTerminal(stripeTerminalId);
    if (!terminal) throw new TerminalNotFoundError(stripeTerminalId);
    if (!terminal.available) throw new TerminalUnavailableError(stripeTerminalId);

    // Recorded as a regular Stripe deposit for the tab user, so the payment
    // is booked under Deposits like any other Stripe top-up. On success, the
    // webhook's deposit handling creates the crediting transfer. If this
    // transaction rolls back, the intent stays behind at Stripe, but no
    // reader ever collects it.
    const { deposit: { stripePaymentIntent } } = await stripeService
      .createStripeDeposit(tab.user, outstanding, { tabId: tab.id }, 'terminal');

    await this.manager.save(TabPaymentAttempt, Object.assign(new TabPaymentAttempt(), {
      tabId: tab.id,
      tab,
      paymentIntentId: stripePaymentIntent.id,
      paymentIntent: stripePaymentIntent,
      processedByTerminal: terminal.id,
    }));

    tab.lockedAt = new Date();
    await this.manager.save(Tab, tab);
    return tab;
  }

  /**
   * Tell the reader of the payment started with {@link startPayment} to
   * collect it. If the reader refuses, the payment is cancelled and the tab
   * reopened.
   *
   * Run this in its own transaction, after the one of {@link startPayment}
   * committed. It locks the tab, so a concurrent {@link cancelPayment} waits
   * for it (or makes it fail with a {@link TabStateError}). It writes nothing
   * when the reader accepts, so the reader never collects a payment that is
   * rolled back.
   * @param id - ID of the tab.
   * @returns Whether the reader accepted the payment. When it did not, the
   * tab is open again.
   * @throws {TabStateError} when the tab is no longer being paid, or when the
   * reader refused but the payment can no longer be cancelled.
   */
  public async collectOnTerminal(id: number): Promise<boolean> {
    const tab = await this.getTabOrFail(id);
    TabService.assertStatus(tab, TabStatus.LOCKED);
    const attempt = await this.getLatestAttempt(tab);
    if (!attempt) throw new Error(`Locked tab "${id}" has no payment attempt.`);

    try {
      await new StripeService(this.manager)
        .startTerminalPayment(attempt.processedByTerminal, attempt.paymentIntent.stripeId);
      return true;
    } catch (error) {
      this.logger.error('tab.payment.collect.failed', { tabId: id, terminal: attempt.processedByTerminal }, error);
    }

    await this.cancelPayment(id);
    return false;
  }

  /**
   * Cancel the terminal payment in progress and reopen the tab.
   * @param id - ID of the tab.
   * @param sendStripeCancellation - Whether to also cancel the reader action
   * and the payment intent at Stripe. False when Stripe itself cancelled it.
   * @throws {TabStateError} when Stripe no longer lets the payment be
   * cancelled, most likely because the card was just charged. The tab then
   * stays locked until the webhook settles it.
   */
  public async cancelPayment(id: number, sendStripeCancellation = true): Promise<Tab> {
    const tab = await this.getTabOrFail(id);
    TabService.assertStatus(tab, TabStatus.LOCKED);

    const attempt = await this.getLatestAttempt(tab);
    if (sendStripeCancellation && attempt) {
      const stripeService = new StripeService(this.manager);
      try {
        await stripeService.cancelTerminalAction(attempt.processedByTerminal);
      } catch (error) {
        // The reader has no action to cancel when it already finished, failed
        // or was reset. Whether the payment can still be cancelled is decided
        // by the intent below.
        this.logger.warn('tab.payment.cancel_reader_action.failed', { tabId: id, terminal: attempt.processedByTerminal }, error);
      }
      try {
        await stripeService.cancelPaymentIntent(attempt.paymentIntent);
      } catch (error) {
        if (intentStatusOf(error) !== 'canceled') {
          this.logger.warn('tab.payment.cancel_intent.failed', { tabId: id, status: intentStatusOf(error) }, error);
          throw new TabStateError('The payment can no longer be cancelled. It may just have been completed.');
        }
      }
    }

    tab.lockedAt = null;
    await this.manager.save(Tab, tab);
    return tab;
  }

  /**
   * Reopen the tab after Stripe ended a payment attempt without charging the
   * card: it was cancelled, or it failed (for example a declined card). The
   * reader is free again, so the tab can be paid with a new attempt. A failed
   * intent is left alone: it is never collected again, and SudoSOS would
   * refuse its success, because it already failed. Only reopens the tab when
   * that attempt is the one in progress.
   */
  public async reopenAfterStripe(paymentIntent: StripePaymentIntent): Promise<void> {
    const tab = await this.getTabByPaymentIntentId(paymentIntent.id);
    if (!tab || tab.status !== TabStatus.LOCKED) return;

    const attempt = await this.getLatestAttempt(tab);
    if (attempt?.paymentIntentId !== paymentIntent.id) return;

    await this.cancelPayment(tab.id, false);
  }

  /**
   * Settle a tab after its terminal payment succeeded: link the transfer that
   * credited the tab user, mark the tab paid and close the tab user. The
   * receipt is sent separately with {@link sendReceipt}, after the database
   * transaction has committed.
   *
   * The payment is a {@link StripeDeposit}, so the webhook's deposit handling
   * ({@link StripeService.handleStripeDepositPaid}) has already created the
   * crediting transfer; it must run first.
   *
   * The card has been charged, so this never throws for a tab in the wrong
   * state: that would roll back the crediting transfer too. A tab that was
   * already paid, invoiced or cancelled is left as it is and an error is
   * logged; the credit stays on the tab user, to be refunded by hand.
   * @param paymentIntent - The intent that Stripe reported as succeeded.
   * @returns The settled tab, or `null` when the tab was left as it is.
   */
  public async settlePaidIntent(paymentIntent: StripePaymentIntent): Promise<Tab | null> {
    const attempt = await this.manager.findOne(TabPaymentAttempt, { where: { paymentIntentId: paymentIntent.id } });
    if (!attempt) throw new Error(`No tab found for payment intent "${paymentIntent.id}".`);
    const tab = await this.getTabOrFail(attempt.tabId);

    if (tab.transfer || ![TabStatus.LOCKED, TabStatus.OPEN].includes(tab.status)) {
      this.logger.error('tab.settle.not_payable', {
        tabId: tab.id, status: tab.status, paymentIntentId: paymentIntent.id, settledBy: tab.transfer?.id,
      });
      return null;
    }
    if (tab.status !== TabStatus.LOCKED) {
      this.logger.warn('tab.settle.unexpected_status', { tabId: tab.id, status: tab.status });
    }

    const deposit = await this.manager.findOne(StripeDeposit, {
      where: { stripePaymentIntent: { id: paymentIntent.id } },
      relations: { transfer: true },
    });
    if (!deposit?.transfer) {
      throw new Error(`Payment intent "${paymentIntent.id}" of tab "${tab.id}" has no paid deposit.`);
    }

    tab.transfer = deposit.transfer;
    tab.paidAt = new Date();
    tab.lockedAt = null;
    await this.manager.save(Tab, tab);
    await this.closeTabUser(tab.user);

    return tab;
  }

  /**
   * Generate (or reuse) the receipt PDF of a paid tab and email it to the
   * contact person.
   */
  public async sendReceipt(tab: Tab): Promise<void> {
    TabService.assertStatus(tab, TabStatus.PAID);
    if (!tab.transfer) throw new Error(`Paid tab "${tab.id}" has no settling transfer.`);

    const pdf = await new TabReceiptPdfService(this.manager).getOrCreate(tab);
    const data = await new FileService(TAB_RECEIPT_PDF_LOCATION).readFile(pdf);

    const recipient = Object.assign(new User(), tab.user, {
      firstName: tab.contactName,
      email: tab.contactEmail,
    });
    await Mailer.getInstance().send(recipient, new TabReceipt({
      tabName: tab.name,
      amount: tab.transfer.amountInclVat.toFormat(),
    }), Language.ENGLISH, {
      attachments: [{
        filename: `receipt-tab-${tab.id}.pdf`,
        // A base64 string, not a Buffer: queued mails are serialized to JSON.
        content: data.toString('base64'),
        encoding: 'base64',
        contentType: 'application/pdf',
      }],
    });
    this.logger.info('tab.receipt.sent', { tabId: tab.id });
  }

  /**
   * Convert an unpaid tab into an invoice account. The tab user becomes an
   * `INVOICE` user, keeping all its transactions, so it can be billed with
   * the regular invoice flow. The user type is changed directly, so no "user
   * type updated" email is sent: the tab user never logs in.
   *
   * The invoice account gets no default address. The invoice form asks for
   * the address anyway, and it is often not known yet when the group leaves.
   * Invoices are not generated automatically for it.
   * @param id - ID of the tab.
   * @param by - The user that converts the tab.
   */
  public async convertToInvoiceAccount(id: number, by: User): Promise<Tab> {
    const tab = await this.getTabOrFail(id);
    TabService.assertStatus(tab, TabStatus.OPEN);

    const outstanding = await this.getOutstanding(tab);
    if (outstanding.isZero()) {
      throw new TabStateError('Tab has nothing to invoice.');
    }

    tab.user.type = UserType.INVOICE;
    await this.manager.save(User, tab.user);
    // The address columns are required, so "no default" is stored as empty.
    await this.manager.save(InvoiceUser, Object.assign(new InvoiceUser(), {
      automatic: false,
      street: '',
      postalCode: '',
      city: '',
      country: '',
      userId: tab.user.id,
      user: tab.user,
    }));

    tab.invoicedAt = new Date();
    tab.invoicedBy = by;
    await this.manager.save(Tab, tab);
    return tab;
  }
}
