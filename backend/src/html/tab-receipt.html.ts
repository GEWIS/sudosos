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
 * This is the module page of the tab-receipt html.
 *
 * @module internal/html
 */

import { createBasePdf } from './base.html';
import { escapeHtml } from './escape';

export interface ITabReceiptItem {
  description: string;
  qty: number;
  /** Unit price including VAT, in cents. */
  unitPriceInclVat: number;
  vatRate: number;
}

/**
 * Parameters of the tab receipt. It is a simplified invoice, like a till
 * receipt, so it deliberately carries nothing that identifies the buyer.
 */
export interface ITabReceiptPdf {
  reference: string;
  paidAt: string;
  items: ITabReceiptItem[];
  /** The amount charged on the card, in cents. */
  totalPaid: number;
}

const nlCurrencyFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format an amount in cents. */
function formatCents(cents: number) {
  return nlCurrencyFormatter.format(cents / 100).replace(/ /g, '');
}

/**
 * Render the receipt of a paid tab as a simplified invoice: date of issue,
 * the goods and the VAT per rate, with the seller and its VAT number in the
 * footer. There are no buyer details, like a till receipt. Amounts are
 * computed in whole cents from the VAT-inclusive prices, which are what the
 * group actually paid; the VAT part of each rate is derived from its
 * inclusive total.
 */
export function createTabReceiptPdf(options: ITabReceiptPdf): string {
  const vatGroups = new Map<number, number>();

  const itemsHtml = options.items.map((item) => {
    const lineTotal = item.unitPriceInclVat * item.qty;
    vatGroups.set(item.vatRate, (vatGroups.get(item.vatRate) ?? 0) + lineTotal);

    return `
      <tr>
        <td>${escapeHtml(item.description)}</td>
        <td class="qty">${item.qty}</td>
        <td class="price">${formatCents(item.unitPriceInclVat)}</td>
        <td>${item.vatRate}%</td>
        <td class="total">${formatCents(lineTotal)}</td>
      </tr>
    `;
  }).join('');

  const vatRows = Array.from(vatGroups.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rate, incl]) => {
      const vat = Math.round(incl - incl / (1 + rate / 100));
      return { rate, base: incl - vat, vat };
    });
  const totalVat = vatRows.reduce((sum, r) => sum + r.vat, 0);

  const meta = `
    <div class="card">
      <h3>Payment</h3>
      <p>Paid by card on ${options.paidAt}</p>
    </div>
  `;

  const details = `
  <table class="items">
    <thead>
      <tr>
        <td>Description</td>
        <td class="qty">Qty</td>
        <td>Unit price incl.</td>
        <td>VAT</td>
        <td style="text-align:right">Total incl.</td>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="summary" style="margin-top:1em; text-align:right; break-inside:avoid; page-break-inside:avoid;">
    <table style="margin-left:auto;text-align:right;margin-top:1.5em;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:0.5em 1em;">VAT</th>
          <th style="padding:0.5em 1em;">Over</th>
          <th style="padding:0.5em 1em;">EUR</th>
        </tr>
      </thead>
      <tbody>
        ${vatRows.map(({ rate, base, vat }) => `
            <tr>
              <td style="padding: 0.5em 1em;">${rate}%</td>
              <td style="padding: 0.5em 1em;">${formatCents(base)}</td>
              <td style="padding: 0.5em 1em;">${formatCents(vat)}</td>
            </tr>
          `).join('')}
        <tr>
          <td style="padding: 0.5em 1em;">Total</td>
          <td style="padding: 0.5em 1em;"></td>
          <td style="padding: 0.5em 1em;">${formatCents(totalVat)}</td>
        </tr>
      </tbody>
    </table>

    <table style="margin-left:auto;text-align:right;margin-top:0.5em;font-weight:bold">
      <tr>
        <td>Total paid</td>
        <td>${formatCents(options.totalPaid)}</td>
      </tr>
    </table>
  </div>
`;

  return createBasePdf({
    pageTitle: 'Tab receipt',
    headerTitle: 'Receipt',
    headerRightTitle: 'Reference',
    headerRightSub: escapeHtml(options.reference),
    meta,
    details,
  });
}
