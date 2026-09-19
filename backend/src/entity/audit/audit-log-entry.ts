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
 * This is the module page of the audit-log-entry.
 *
 * @module audit-logs
 */

import { Column, Entity, Index, ManyToOne } from 'typeorm';
import BaseEntity from '../base-entity';
import User from '../user/user';

/**
 * The kinds of object a financial mutation can be recorded against. Used to look
 * up everything that has happened to one invoice, payout or product.
 */
export enum AuditEntityType {
  INVOICE = 'Invoice',
  SELLER_PAYOUT = 'SellerPayout',
  PAYOUT_REQUEST = 'PayoutRequest',
  WRITE_OFF = 'WriteOff',
  TRANSACTION = 'Transaction',
  TRANSFER = 'Transfer',
  PRODUCT = 'Product',
  FINE = 'Fine',
  FINE_HANDOUT_EVENT = 'FineHandoutEvent',
  PAYMENT_REQUEST = 'PaymentRequest',
  INACTIVE_ADMINISTRATIVE_COST = 'InactiveAdministrativeCost',
  VOUCHER_GROUP = 'VoucherGroup',
}

/**
 * The recorded financial mutations. The value doubles as the message of the
 * matching log line, so that a row in this table and a line in the logs can be
 * found by the same string.
 */
export enum AuditAction {
  INVOICE_CREATE = 'invoice.create',
  INVOICE_UPDATE = 'invoice.update',
  INVOICE_DELETE = 'invoice.delete',
  SELLER_PAYOUT_CREATE = 'seller_payout.create',
  SELLER_PAYOUT_UPDATE = 'seller_payout.update',
  SELLER_PAYOUT_DELETE = 'seller_payout.delete',
  PAYOUT_REQUEST_CREATE = 'payout_request.create',
  PAYOUT_REQUEST_UPDATE_STATUS = 'payout_request.update_status',
  WRITE_OFF_CREATE = 'write_off.create',
  TRANSACTION_UPDATE = 'transaction.update',
  TRANSACTION_DELETE = 'transaction.delete',
  TRANSFER_CREATE = 'transfer.create',
  TRANSFER_DELETE = 'transfer.delete',
  PRODUCT_CREATE = 'product.create',
  PRODUCT_UPDATE = 'product.update',
  PRODUCT_DELETE = 'product.delete',
  FINE_HANDOUT = 'fine.handout',
  FINE_DELETE = 'fine.delete',
  FINE_HANDOUT_DELETE = 'fine.delete_handout',
  FINE_WAIVE = 'fine.waive',
  PAYMENT_REQUEST_CREATE = 'payment_request.create',
  PAYMENT_REQUEST_CANCEL = 'payment_request.cancel',
  PAYMENT_REQUEST_MARK_FULFILLED = 'payment_request.mark_fulfilled',
  INACTIVE_ADMINISTRATIVE_COST_CREATE = 'inactive_administrative_cost.create',
  INACTIVE_ADMINISTRATIVE_COST_DELETE = 'inactive_administrative_cost.delete',
  VOUCHER_GROUP_CREATE = 'voucher_group.create',
  VOUCHER_GROUP_UPDATE = 'voucher_group.update',
}

/**
 * A single financial mutation, recorded so that it stays answerable who changed
 * what. Entries are append-only: nothing updates or deletes them.
 *
 * @typedef {allOf|BaseEntity} AuditLogEntry
 * @property {User} actor - The user that performed the mutation, absent once that
 * user has been removed.
 * @property {string} actorName.required - The name the actor had at the time.
 * @property {string} action.required - The recorded mutation.
 * @property {string} entityType.required - The kind of object that was mutated.
 * @property {integer} entityId - The id of the object that was mutated.
 * @property {object} changes - The fields that changed, as JSON.
 */
@Entity()
@Index(['entityType', 'entityId'])
export default class AuditLogEntry extends BaseEntity {
  /**
   * Cleared when the user is removed, so removing a user never removes the record
   * of what they did. The name of the actor is stored separately, which also keeps
   * an entry readable after a rename.
   */
  @Index()
  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  public actor: User | null;

  @Column({ length: 255 })
  public actorName: string;

  @Column({ length: 64 })
  public action: AuditAction;

  @Column({ length: 64 })
  public entityType: AuditEntityType;

  @Column({ type: 'int', nullable: true })
  public entityId: number | null;

  @Column({ type: 'simple-json', nullable: true })
  public changes: Record<string, unknown> | null;
}
