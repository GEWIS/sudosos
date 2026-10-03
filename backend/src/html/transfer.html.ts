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

import { balanceNoticeHtml, createBasePdf, singleAmountHtml } from './base.html';
import { escapeHtml } from './escape';

export interface ITransferPdf {
  transferId: string;
  fromUserFirstName: string;
  fromUserLastName: string;
  fromAccount: string;
  toUserFirstName: string;
  toUserLastName: string;
  toAccount: string;
  date: string;
  description: string;
  amount: string;
}

export function createTransferPdf(options: ITransferPdf): string {
  const meta = `
    <div class="card">
      <h3>From</h3>
      <p>${escapeHtml(options.fromUserFirstName)} ${escapeHtml(options.fromUserLastName)}</p>
      <div class="small">Account: ${escapeHtml(options.fromAccount)}</div>
    </div>
    <div class="card">
      <h3>To</h3>
      <p>${escapeHtml(options.toUserFirstName)} ${escapeHtml(options.toUserLastName)}</p>
      <div class="small">Account: ${escapeHtml(options.toAccount)}</div>
    </div>
    <div class="card">
      <h3>Date</h3>
      <p>${escapeHtml(options.date)}</p>
    </div>
  `;

  const details = balanceNoticeHtml(
    'Balance Transfer',
    'This document records a balance movement within SudoSOS, showing the transferred amount and the originating and/or receiving account.',
  ) + singleAmountHtml(options.description, options.amount);

  return createBasePdf({
    pageTitle: 'Transfer PDF',
    headerTitle: 'Transfer Info',
    headerRightTitle: 'Transfer ID',
    headerRightSub: escapeHtml(options.transferId),
    meta,
    details,
  });
}
