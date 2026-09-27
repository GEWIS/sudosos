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
 * Write-off PDF: records that a negative SudoSOS balance was written off.
 * Compiled to a PDF by `pdf-compiler`.
 */

import { balanceNoticeHtml, createBasePdf, singleAmountHtml } from './base.html';
import { escapeHtml } from './escape';

export interface IWriteOffPdf {
  /** Write-off number, e.g. SDS-WR-0001. */
  reference: string;
  /** Name of the user whose balance was written off. */
  account: string;
  /** The user's User.id. */
  accountId: string;
  date: string;
  amount: string;
  serviceEmail: string;
}

export function createWriteOffPdf(options: IWriteOffPdf): string {
  const meta = `
    <div class="card">
      <h3>Account</h3>
      <p>${escapeHtml(options.account)}</p>
      <div class="small">Account: ${escapeHtml(options.accountId)}</div>
    </div>
    <div class="card">
      <h3>Date</h3>
      <p>${escapeHtml(options.date)}</p>
    </div>
  `;

  const details = balanceNoticeHtml(
    'Write-off',
    'This document records that the negative balance of the account shown above has been written off, bringing the balance back to zero.',
  ) + singleAmountHtml('Write-off of negative balance', options.amount);

  return createBasePdf({
    pageTitle: 'Write-off PDF',
    headerTitle: 'Write-off',
    headerRightTitle: 'Write-off number',
    headerRightSub: escapeHtml(options.reference),
    meta,
    details,
    serviceEmail: options.serviceEmail,
  });
}
