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
 * Voucher group statement PDF. The same "F6c" document as the Invoice, with a
 * "Voucher Statement" band label, the purchaser's address block, the voucher
 * group meta rows and a note summarising the issued cards. Compiled to a PDF
 * by `pdf-compiler`.
 */

import { BAC } from '../files/templates/bac-letterhead';
import {
  createDocumentPdf,
  escapeHtml,
  fmt,
  IDocumentAddress,
  IDocumentLineItem,
  IDocumentVatBand,
  recipientBlock,
  subjectSection,
} from './document.html';

export interface IVoucherGroupPdf {
  /** Voucher number, e.g. SDS-VG-0001. */
  reference: string;
  /** VoucherGroup.id, shown as "Sequence number". */
  identifier: string;
  /** Date the voucher group was created. */
  date: string;
  /** VoucherGroup.name; rendered as the "Description" section. */
  name: string;
  addressee: string;
  /** "For the attention of" line; omitted when empty. */
  attention: string;
  address: IDocumentAddress;
  /** First day the cards can be used. */
  startDate: string;
  /** Last day the cards can be used. */
  endDate: string;
  /** Number of voucher cards in the group; each card is its own line item. */
  amount: number;
  /** Balance on each card, in euros. */
  balancePerCard: number;
  vatBreakdown: IDocumentVatBand[];
  lineItems: IDocumentLineItem[];
  totalIncl: number;
  subtotalExcl: number;
  totalVat: number;
}

/**
 * Render the voucher group statement PDF HTML via the shared document skeleton.
 */
export function createVoucherGroupPdf(options: IVoucherGroupPdf): string {
  const noteHtml = `
          This statement concerns the issue of <strong>${options.amount}</strong>
          voucher card${options.amount === 1 ? '' : 's'} with a balance of
          <strong>${fmt(options.balancePerCard)}</strong> each, for a total of
          <strong>${fmt(options.totalIncl)}</strong>. The cards can be used from
          <strong>${escapeHtml(options.startDate)}</strong> until <strong>${escapeHtml(options.endDate)}</strong>.
          Balances in SudoSOS qualify as Multi Purpose Vouchers (MPV) under
          <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016L1065">Directive (EU) 2016/1065</a>.
          No VAT is due on the issue of these vouchers; VAT only becomes applicable
          when the balance is used to purchase goods or services.
          Please use reference <strong>${escapeHtml(options.reference)}</strong> in any correspondence.`;

  return createDocumentPdf({
    bandLabel: 'Voucher Statement',
    reference: options.reference,
    recipientHtml: recipientBlock(options.addressee, options.attention, options.address),
    metaRows: [
      { lbl: 'Date', v: escapeHtml(options.date) },
      { lbl: 'Voucher number', v: escapeHtml(options.reference) },
      { lbl: 'Sequence number', v: escapeHtml(options.identifier) },
      { lbl: 'Valid from', v: escapeHtml(options.startDate) },
      { lbl: 'Valid until', v: escapeHtml(options.endDate) },
      { lbl: 'Number of cards', v: String(options.amount) },
    ],
    subjectSection: subjectSection('Description', options.name),
    totalIncl: options.totalIncl,
    totalLabel: 'Total allocated balance',
    noteHtml,
    specDescription: 'Voucher balance',
    vatBreakdown: options.vatBreakdown,
    subtotalExcl: options.subtotalExcl,
    totalVat: options.totalVat,
    questionsLine: `Questions about this statement? Email ${escapeHtml(BAC.email)}`,
    lineItemsLabel: 'Line items',
    lineItemsMetaRows: [
      { lbl: 'Date', v: escapeHtml(options.date) },
      { lbl: 'Voucher number', v: escapeHtml(options.reference) },
    ],
    lineItems: options.lineItems,
  });
}
