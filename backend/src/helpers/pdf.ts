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
 * This is the module page of the pdf.
 *
 * @module helpers
 */

import { Report } from '../entity/report/report';
import { IDocumentLineItem, IDocumentVatBand } from '../html/document.html';

export const PDF_VAT_ZERO = 0;
export const PDF_VAT_LOW = 9;
export const PDF_VAT_HIGH = 21;

/**
 * Format a date to YYYYMMDD string format for use in PDF filenames and titles
 * @param date - The date to format
 * @returns Formatted date string in YYYYMMDD format
 */
export function formatTitleDate(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Enum for the type of user report (sales or purchases).
 */
export enum UserReportType {
  Sales = 'sales',
  Purchases = 'purchases',
}

export interface IReportDocumentLines {
  lineItems: IDocumentLineItem[];
  vatBreakdown: IDocumentVatBand[];
  totalIncl: number;
  subtotalExcl: number;
  totalVat: number;
}

/**
 * Map a report's products and VAT groups onto the line items, VAT
 * specification and totals of the shared HTML document (euros, not cents).
 * @param report - The report to convert
 */
export function reportToDocumentLines(report: Report): IReportDocumentLines {
  const lineItems = (report.data.products ?? [])
    .map((p) => {
      const excl = p.totalExclVat.getAmount();
      const incl = p.totalInclVat.getAmount();
      return {
        description: p.product.name,
        qty: p.count,
        rate: p.product.vat.percentage,
        excl: excl / 100,
        vat: (incl - excl) / 100,
        incl: incl / 100,
      };
    })
    .sort((a, b) => a.description.localeCompare(b.description));

  const vatBreakdown = (report.data.vat ?? [])
    .map((v) => {
      const excl = v.totalExclVat.getAmount();
      const incl = v.totalInclVat.getAmount();
      return {
        rate: v.vat.percentage,
        excl: excl / 100,
        vat: (incl - excl) / 100,
        incl: incl / 100,
      };
    })
    .sort((a, b) => a.rate - b.rate);

  const exclCents = report.totalExclVat.getAmount();
  const inclCents = report.totalInclVat.getAmount();

  return {
    lineItems,
    vatBreakdown,
    totalIncl: inclCents / 100,
    subtotalExcl: exclCents / 100,
    totalVat: (inclCents - exclCents) / 100,
  };
}

/**
 * File type a PDF-able document can be returned as: the compiled PDF, or the
 * raw HTML that is sent to pdf-compiler (useful for previews and debugging).
 */
export enum ReturnFileType {
  PDF = 'PDF',
  HTML = 'HTML',
}
