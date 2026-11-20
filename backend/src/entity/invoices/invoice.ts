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
 * An `Invoice` settles purchases that a user pays outside SudoSOS, by bank transfer. Any user
 * except an organ can be invoiced. The invoice is sent to them as a PDF.
 *
 * ### Creating
 * `POST /invoices` takes the recipient (`forId`) and their transaction IDs.
 * `GET /invoices/eligible-transactions` lists transactions that are not invoiced yet.
 * {@link InvoiceService.createInvoice | createInvoice}:
 * - refuses transactions not bought by `forId`, or already on an invoice;
 * - creates a {@link transfers!Transfer | Transfer} from `null` to `forId`, which credits the recipient;
 * - saves the invoice with status `CREATED` and links its
 *   {@link transactions/sub-transactions!SubTransactionRow | SubTransactionRows}.
 *
 * For `INVOICE` users, missing address fields are filled in from their {@link InvoiceUser}.
 *
 * ### Status
 * The status is the latest {@link InvoiceStatus} row: `CREATED`, `SENT`, `PAID` or `DELETED`.
 * `PATCH /invoices/{id}` adds a status row only when it changes `state`. `PAID` and `DELETED`
 * invoices cannot be patched.
 *
 * ### Deleting
 * `DELETE /invoices/{id}`, or a `PATCH` to `DELETED`, adds a credit transfer that reverses the
 * invoice, unlinks the rows so they can be invoiced again, and adds a `DELETED` status. The invoice
 * row is kept.
 *
 * ### Drift
 * The transfer amount is not recomputed. `GET /invoices/drift` lists invoices whose transfers no
 * longer match their rows.
 *
 * ### PDF
 * `GET /invoices/{id}/pdf` renders and stores an {@link InvoicePdf}. Pass `?force=true` to render
 * it again.
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
