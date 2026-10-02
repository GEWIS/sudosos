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
 * Sales / purchase report PDF. The same "F6c" document as the Invoice and
 * Seller Payout, listing the products a user sold or bought in a period
 * with a VAT specification. Compiled to a PDF by `pdf-compiler`.
 */

import {
  createDocumentPdf,
  escapeHtml,
  IDocumentLineItem,
  IDocumentVatBand,
  subjectSection,
} from './document.html';
import { BAC } from '../files/templates/bac-letterhead';
import { UserReportType } from '../helpers/pdf';

export interface IUserReportPdf {
  kind: UserReportType;
  /** Name of the user the report is for. */
  account: string;
  /** The user's User.id, shown as "Customer number". */
  customerNumber: string;
  startDate: string;
  endDate: string;
  /** Free-text description; only rendered when non-empty. */
  description: string;
  vatBreakdown: IDocumentVatBand[];
  lineItems: IDocumentLineItem[];
  totalIncl: number;
  subtotalExcl: number;
  totalVat: number;
}

/**
 * Render the sales / purchase report PDF HTML via the shared document skeleton.
 */
export function createUserReportPdf(options: IUserReportPdf): string {
  const isSales = options.kind === UserReportType.Sales;
  const period = `${options.startDate} – ${options.endDate}`;
  const noteHtml = `
          This is an overview of your ${isSales ? 'sales' : 'purchases'} in the SudoSOS system in the period
          <strong>${escapeHtml(options.startDate)}</strong> to <strong>${escapeHtml(options.endDate)}</strong>.`;

  const metaRows = [
    { lbl: 'Account', v: escapeHtml(options.account) },
    { lbl: 'Start date', v: escapeHtml(options.startDate) },
    { lbl: 'End date', v: escapeHtml(options.endDate) },
    { lbl: 'Customer number', v: escapeHtml(options.customerNumber) },
  ];

  return createDocumentPdf({
    bandLabel: isSales ? 'Sales Report' : 'Purchase Report',
    reference: period,
    // The account is shown in the meta-list (top right), so the recipient block stays empty.
    recipientHtml: '',
    metaRows,
    subjectSection: subjectSection('Description', options.description),
    totalIncl: options.totalIncl,
    totalLabel: 'Total including VAT',
    noteHtml,
    specDescription: isSales ? 'Sales' : 'Purchases',
    vatBreakdown: options.vatBreakdown,
    subtotalExcl: options.subtotalExcl,
    totalVat: options.totalVat,
    questionsLine: `Questions about this report? Email ${escapeHtml(BAC.email)}`,
    lineItemsLabel: 'Line items',
    lineItemsMetaRows: [
      { lbl: 'Account', v: escapeHtml(options.account) },
      { lbl: 'Period', v: escapeHtml(period) },
    ],
    lineItems: options.lineItems,
  });
}
