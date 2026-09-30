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
 * Payout request PDF: records a payout of SudoSOS balance to a bank account.
 * Compiled to a PDF by `pdf-compiler`.
 */

import { balanceNoticeHtml, createBasePdf, singleAmountHtml } from './base.html';
import { escapeHtml } from './escape';

export interface IPayoutRequestPdf {
  /** Payout request number, e.g. SDS-PR-0001. */
  reference: string;
  /** Name of the user who requested the payout. */
  requestedBy: string;
  /** The requester's User.id. */
  accountId: string;
  bankAccountName: string;
  bankAccountNumber: string;
  date: string;
  amount: string;
}

export function createPayoutRequestPdf(options: IPayoutRequestPdf): string {
  const meta = `
    <div class="card">
      <h3>Requested by</h3>
      <p>${escapeHtml(options.requestedBy)}</p>
      <div class="small">Account: ${escapeHtml(options.accountId)}</div>
    </div>
    <div class="card">
      <h3>Paid out to</h3>
      <p>${escapeHtml(options.bankAccountName)}</p>
      <div class="small">IBAN: ${escapeHtml(options.bankAccountNumber)}</div>
    </div>
    <div class="card">
      <h3>Date</h3>
      <p>${escapeHtml(options.date)}</p>
    </div>
  `;

  const details = balanceNoticeHtml(
    'Payout',
    'This document records a payout of SudoSOS balance to the bank account shown above.',
  ) + singleAmountHtml('Payout of SudoSOS balance', options.amount);

  return createBasePdf({
    pageTitle: 'Payout PDF',
    headerTitle: 'Payout',
    headerRightTitle: 'Payout number',
    headerRightSub: escapeHtml(options.reference),
    meta,
    details,
  });
}
