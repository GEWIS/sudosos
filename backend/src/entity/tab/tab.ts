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
 * This is the module page of the tab.
 *
 * A `Tab` lets a group (for example an external party at a social drink) run
 * up purchases at the point of sale and pay for all of them at once, with a
 * Stripe Terminal card payment. Afterwards, the contact person of the tab
 * receives a PDF receipt by email. The receipt is a simplified invoice, like a
 * till receipt: it names the seller and the VAT per rate, but not the buyer.
 *
 * ## Ledger model
 * Every tab owns a dedicated {@link users!User | User} of type `TAB`. The
 * point of sale sells to this user like to any other buyer, so its purchases
 * are ordinary {@link transactions!Transaction | Transactions} and its balance
 * goes negative. Paying the tab is a {@link stripe!StripeDeposit | StripeDeposit}
 * for the outstanding amount, paid on a card reader. Its void->user
 * {@link transactions!Transfer | Transfer} brings the balance back to zero, and
 * is booked under Deposits like any other Stripe top-up.
 *
 * ## Bookkeeping
 * The purchases are ordinary transactions, so they count in the sellers'
 * sales. The receipt is a simplified invoice without buyer details, not a full
 * {@link invoicing!Invoice | Invoice}. Only converting an unpaid tab to an
 * invoice account leads to a full invoice.
 *
 * ## Lifecycle
 * Status is **derived**, not stored. See {@link Tab.status}.
 * - `OPEN` - purchases can be added to the tab.
 * - `LOCKED` - a terminal payment is in progress. No purchases can be added
 *   or changed, so the amount on the card reader matches the ledger.
 *   Cancelling the payment reopens the tab.
 * - `PAID` - the terminal payment succeeded. The receipt is emailed.
 *   Its transactions count as paid by card terminal and can never be
 *   changed again.
 * - `INVOICED` - the group did not pay at the terminal. The tab user was
 *   converted into an `INVOICE` user, and is billed with the regular
 *   {@link invoicing!Invoice | Invoice} flow.
 * - `CANCELLED` - the tab was closed before anything was bought.
 *
 * ## Payment attempts
 * Every attempt to pay a tab mints a fresh
 * {@link stripe!StripePaymentIntent | StripePaymentIntent}, recorded as a
 * {@link TabPaymentAttempt}, so a declined or cancelled card payment can be
 * retried.
 *
 * @module tabs
 * @mergeTarget
 */

import {
  Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne,
} from 'typeorm';
import BaseEntity from '../base-entity';
import User from '../user/user';
import Transfer from '../transactions/transfer';
import TabReceiptPdf from '../file/tab-receipt-pdf';
import TabPaymentAttempt from './tab-payment-attempt';

export enum TabStatus {
  OPEN = 'OPEN',
  LOCKED = 'LOCKED',
  PAID = 'PAID',
  INVOICED = 'INVOICED',
  CANCELLED = 'CANCELLED',
}

/**
 * A group tab, backed by its own `TAB` user. See the module page for the
 * lifecycle.
 *
 * @typedef {BaseEntity} Tab
 * @property {string} name.required - Name of the tab, shown at the point of sale.
 * @property {string} contactName.required - Name of the contact person of the group.
 * @property {string} contactEmail.required - Email address the receipt is sent to.
 * @property {User.model} user.required - The internal user that the purchases are made on.
 * @property {User.model} createdBy.required - The user that opened the tab.
 * @property {string} lockedAt - When the current terminal payment started (null if none is in progress).
 * @property {string} paidAt - When the tab was paid.
 * @property {string} invoicedAt - When the tab was converted to an invoice account.
 * @property {User.model} invoicedBy - Who converted the tab to an invoice account.
 * @property {string} cancelledAt - When the tab was cancelled.
 * @property {Transfer.model} transfer - The transfer that settled the tab.
 */
@Entity()
export default class Tab extends BaseEntity {
  @Column({ length: 64 })
  public name: string;

  @Column({ length: 64 })
  public contactName: string;

  @Column({ length: 64 })
  public contactEmail: string;

  /** The internal `TAB` user that the purchases are made on. */
  @OneToOne(() => User, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn()
  public user: User;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn()
  public createdBy: User;

  /** Set while a terminal payment is in progress. */
  @Column({ type: 'datetime', nullable: true })
  public lockedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  public paidAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  public invoicedAt: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  public invoicedBy: User | null;

  @Column({ type: 'datetime', nullable: true })
  public cancelledAt: Date | null;

  /** The void->user transfer that settled the tab. */
  @OneToOne(() => Transfer, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn()
  public transfer: Transfer | null;

  @Column({ nullable: true })
  public pdfId?: number;

  @OneToOne(() => TabReceiptPdf, { eager: true, nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn()
  public pdf?: TabReceiptPdf;

  @OneToMany(() => TabPaymentAttempt, (a) => a.tab)
  public attempts: TabPaymentAttempt[];

  /**
   * Derived status. Order of precedence:
   * `PAID` > `INVOICED` > `CANCELLED` > `LOCKED` > `OPEN`.
   */
  public get status(): TabStatus {
    if (this.paidAt) return TabStatus.PAID;
    if (this.invoicedAt) return TabStatus.INVOICED;
    if (this.cancelledAt) return TabStatus.CANCELLED;
    if (this.lockedAt) return TabStatus.LOCKED;
    return TabStatus.OPEN;
  }

  constructor() {
    super();
    this.lockedAt = null;
    this.paidAt = null;
    this.invoicedAt = null;
    this.invoicedBy = null;
    this.cancelledAt = null;
    this.transfer = null;
  }
}
