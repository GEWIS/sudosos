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
 * This is the module page of the voucher-group-response.
 *
 * @module vouchers
 */

import BaseResponse from './base-response';
import { UserResponse } from './user-response';
import { PaginationResult } from '../../helpers/pagination';
import { DineroObjectResponse } from './dinero-response';

/**
  * @typedef {allOf|BaseResponse} VoucherGroupResponse
  * @property {string} name.required - Name of the voucher group
  * @property {string} activeStartDate - Start date of the voucher group
  * @property {string} activeEndDate.required - End date of the voucher group
  * @property {Array<UserResponse>} users.required - Users in the voucher group
  * @property {DineroObjectRequest} balance.required - Start balance to be assigned
  *  to the voucher users
  * @property {number} amount.required - Amount of users to be assigned to the voucher group
  * @property {string} invoiceDate.required - Date printed on the statement PDF
  * @property {string} addressee.required - Name of the purchaser
  * @property {string} attention.required - "For the attention of" line
  * @property {string} street.required - Street of the purchaser
  * @property {string} postalCode.required - Postal code of the purchaser
  * @property {string} city.required - City of the purchaser
  * @property {string} country.required - Country of the purchaser
  * @property {string} pdf - Download name of the latest statement PDF, if generated
  */
export default interface VoucherGroupResponse extends BaseResponse {
  name: string,
  activeStartDate?: string,
  activeEndDate: string,
  amount: number,
  invoiceDate: string,
  balance: DineroObjectResponse,
  users: UserResponse[],
  addressee: string,
  attention: string,
  street: string,
  postalCode: string,
  city: string,
  country: string,
  pdf?: string,
}

/**
 * @typedef {object} PaginatedVoucherGroupResponse
 * @property {PaginationResult} _pagination.required - Pagination metadata
 * @property {Array<VoucherGroupResponse>} records.required - Returned voucher groups
 */
export interface PaginatedVoucherGroupResponse {
  _pagination: PaginationResult,
  records: VoucherGroupResponse[],
}
