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
 * An `Invoice` settles purchases that a user will pay for outside SudoSOS, by bank
 * transfer. Typical recipients are external parties with an `INVOICE` account. Their
 * balance goes negative as they buy; the invoice brings it back and is sent to them as a
 * PDF.
 *
 * An invoice can only hold transactions bought by its recipient, so the recipient must be a
 * user type that can buy. By default that is the `Buyer` role: `MEMBER`, `VOUCHER`,
 * `LOCAL_USER` and `INVOICE`. Organs cannot be invoiced, because
 * `TransactionService.verifyTransaction` rejects every transaction bought by an `ORGAN`.
 *
 * ### Creating an invoice
 * `POST /invoices` takes the recipient (`forId`) and the IDs of their transactions.
 * `GET /invoices/eligible-transactions` lists the transactions of a user in a date range
 * that are not yet on an invoice. {@link InvoiceService.createInvoice | createInvoice} then:
 * - refuses if a transaction was not bought by `forId`, or if any of its
 *   {@link transactions/sub-transactions!SubTransactionRow | SubTransactionRows} is already
 *   on an invoice;
 * - creates a {@link transfers!Transfer | Transfer} with `from = null` and `to = forId` for
 *   the requested amount, which credits the recipient's balance;
 * - saves the {@link Invoice} with a first {@link InvoiceStatus} of `CREATED`;
 * - sets `invoice` on every sub-transaction row of those transactions.
 *
 * Default address fields are stored per user as an {@link InvoiceUser}, managed through
 * `/invoices/users/{id}`. Both `INVOICE` and `ORGAN` users can have one, but `POST /invoices`
 * only applies the defaults when the recipient is an `INVOICE` user. It then fills in the
 * street, postal code, city and country that the request leaves out, and uses the
 * recipient's name as `addressee`.
 *
 * ### Status history
 * The status of an invoice is the latest {@link InvoiceStatus} row. Each row stores the
 * {@link InvoiceState} and the user in `changedBy`, so the full history is kept. The states
 * are `CREATED`, `SENT`, `PAID` and `DELETED`. `PATCH /invoices/{id}` adds a new status
 * row, and can also change the address fields and the transfer amount. `PATCH` refuses
 * invoices that are `PAID` or `DELETED`.
 *
 * ### Deleting an invoice
 * `DELETE /invoices/{id}`, or a `PATCH` to `DELETED`, reverses the invoice:
 * - a credit transfer with `from = recipient` and `to = null` and the same amount is
 *   stored as `creditTransfer`;
 * - the sub-transaction rows are moved to `subTransactionRowsDeletedInvoice` and their
 *   `invoice` is cleared, so they can be put on a new invoice;
 * - a `DELETED` status row is added.
 *
 * The invoice row itself is kept. `DELETE` only refuses invoices that are already
 * `DELETED`, so it can still reverse a `PAID` invoice.
 *
 * ### Drift
 * The transfer amount is set by hand and is not recomputed. `GET /invoices/drift` lists
 * invoices whose transfer no longer matches the sum of their rows, and deleted invoices
 * whose credit transfer does not match the original transfer.
 *
 * ### PDF
 * `GET /invoices/{id}/pdf` renders the invoice with
 * {@link internal/pdf/invoice-pdf-service!InvoicePdfService | InvoicePdfService} and stores it as an
 * {@link InvoicePdf}. The stored PDF is returned on later requests. It is rendered again
 * when `?force=true` is passed, or after a `PATCH` whose body contains any field besides
 * `state`, `amount` and `byId`, even if its value is unchanged.
 *
 * For API interactions, refer to the [Swagger Documentation](https://sudosos.gewis.nl/api/api-docs/#/invoices).
 *
 * @module invoicing
 * @mergeTarget
 */

import {
  Column,
  Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, ManyToMany, JoinTable,
} from 'typeorm';
import BaseEntity from '../base-entity';
import User from '../user/user';
import Transfer from '../transactions/transfer';
// eslint-disable-next-line import/no-cycle
import InvoiceStatus from './invoice-status';
import InvoicePdf from '../file/invoice-pdf';
import SubTransactionRow from '../transactions/sub-transaction-row';


@Entity()
export default class Invoice extends BaseEntity {

  /**
   * The ID of the account for whom the invoice is
   */
  @Column({ nullable: false })
  public toId: number;

  /**
   * The account for whom the invoice is
   */
  @ManyToOne(() => User, { nullable: false })
  public to: User;

  /**
   * The transfer entity representing the invoice.
   */
  @OneToOne(() => Transfer, {
    nullable: false,
  })
  @JoinColumn()
  public transfer: Transfer;

  /**
   * The status history of the invoice
   */
  @OneToMany(() => InvoiceStatus,
    (invoiceStatus) => invoiceStatus.invoice,
    { cascade: true })
  public invoiceStatus: InvoiceStatus[];

  /**
   * Name of the addressed
   */
  @Column()
  public addressee: string;

  /**
   * Special attention to the addressee
   */
  @Column({ nullable: true, default: '' })
  public attention: string;

  /**
   * The description of the invoice
   */
  @Column({ nullable: true, default: '' })
  public description: string;

  /**
   * The ID of the PDF file
   */
  @Column({ nullable: true })
  public pdfId?: number;

  /**
   * The PDF file
   *
   * onDelete: 'CASCADE' is not possible here, because removing the
   * pdf from the database will not remove it from storage
   */
  @OneToOne(() => InvoicePdf, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn()
  public pdf?: InvoicePdf;

  /**
   * The reference of the invoice
   */
  @Column()
  public reference: string;

  /**
   * Street to use on the invoice
   */
  @Column()
  public street: string;

  /**
   * Postal code to use on the invoice
   */
  @Column()
  public postalCode:string;

  /**
   * City to use on the invoice
   */
  @Column()
  public city: string;

  /**
   * Country to use on the invoice
   */
  @Column()
  public country: string;

  @Column({ nullable: true })
  public creditTransferId?: number;

  /**
   * If this invoice is deleted, this will be credit transfer.
   */
  @OneToOne(() => Transfer, (t) => t.creditInvoice, { nullable: true })
  @JoinColumn()
  public creditTransfer?: Transfer;

  /**
   * Date of the invoice
   */
  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public date: Date;

  @OneToMany(() => SubTransactionRow, (row) => row.invoice, { cascade: false })
  public subTransactionRows: SubTransactionRow[];

  // Force junction table name to match mysql table name
  @ManyToMany(() => SubTransactionRow, { cascade: false })
  @JoinTable({ name: 'inv_sub_tra_row_del_inv_sub_tra_row' })
  public subTransactionRowsDeletedInvoice: SubTransactionRow[];
}
