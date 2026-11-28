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
 * This is the module page of the tab-response.
 *
 * @module tabs
 */

import BaseResponse from './base-response';
import { BaseUserResponse } from './user-response';
import { DineroObjectResponse } from './dinero-response';
import { PaginationResult } from '../../helpers/pagination';
import type { TabStatus } from '../../entity/tab/tab';

/**
 * @typedef {allOf|BaseResponse} TabResponse
 * @property {string} name.required - Name of the tab.
 * @property {string} contactName.required - Name of the contact person of the group.
 * @property {string} contactEmail.required - Email address the receipt is sent to.
 * @property {string} status.required - enum:OPEN,LOCKED,PAID,INVOICED,CANCELLED - Derived status of the tab.
 * @property {BaseUserResponse} user.required - The internal user the purchases are made on.
 * @property {BaseUserResponse} createdBy.required - The user that opened the tab.
 * @property {DineroObjectResponse} outstanding.required - The amount that still has to be paid.
 * @property {string} paidAt - When the tab was paid.
 * @property {string} invoicedAt - When the tab was converted to an invoice account.
 * @property {string} cancelledAt - When the tab was cancelled.
 * @property {string} processedByTerminal - The Stripe Terminal handling the current payment, if the tab is LOCKED.
 */
export interface TabResponse extends BaseResponse {
  name: string;
  contactName: string;
  contactEmail: string;
  status: TabStatus;
  user: BaseUserResponse;
  createdBy: BaseUserResponse;
  outstanding: DineroObjectResponse;
  paidAt?: string;
  invoicedAt?: string;
  cancelledAt?: string;
  processedByTerminal?: string;
}

/**
 * @typedef {object} PaginatedTabResponse
 * @property {PaginationResult} _pagination.required - Pagination metadata
 * @property {Array<TabResponse>} records.required - Returned tabs
 */
export interface PaginatedTabResponse {
  _pagination: PaginationResult,
  records: TabResponse[],
}
