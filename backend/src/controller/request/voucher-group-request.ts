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
 * This is the module page of the voucher-group-request.
 *
 * @module vouchers
 */

import DineroFactory from 'dinero.js';
import { DineroObjectRequest } from './dinero-request';

/**
 * @typedef {object} VoucherGroupRequest
 * @property {string} name.required - Name of the group
 * @property {string} activeStartDate.required - Date from which the included cards are active
 * @property {string} activeEndDate.required - Date from which cards are no longer active
 * @property {DineroObjectRequest} balance.required - Start balance to be assigned
 *  to the voucher users
 * @property {number} amount.required - Amount of users to be assigned to the voucher group
 * @property {string} invoiceDate - Date printed on the statement PDF. Defaults to today on
 *  create and is left unchanged on update when omitted.
 * @property {string} addressee.required - Name of the purchaser, shown on the voucher group PDF
 * @property {string} attention - "For the attention of" line on the voucher group PDF
 * @property {string} street.required - Street of the purchaser
 * @property {string} postalCode.required - Postal code of the purchaser
 * @property {string} city.required - City of the purchaser
 * @property {string} country.required - Country of the purchaser
 */
export interface VoucherGroupRequest extends VoucherGroupAddress {
  name: string,
  activeStartDate: string,
  activeEndDate: string,
  balance: DineroObjectRequest,
  amount: number,
  invoiceDate?: string,
}

/**
 * @typedef {object} VoucherGroupAddressRequest
 * @property {string} addressee.required - Name of the purchaser, shown on the voucher group PDF
 * @property {string} attention - "For the attention of" line on the voucher group PDF
 * @property {string} street.required - Street of the purchaser
 * @property {string} postalCode.required - Postal code of the purchaser
 * @property {string} city.required - City of the purchaser
 * @property {string} country.required - Country of the purchaser
 * @property {string} invoiceDate - Date printed on the statement PDF; left unchanged when omitted
 */
export interface VoucherGroupAddressRequest extends VoucherGroupAddress {
  invoiceDate?: string,
}

export interface VoucherGroupAddress {
  addressee: string,
  attention?: string,
  street: string,
  postalCode: string,
  city: string,
  country: string,
}

export interface VoucherGroupParams extends VoucherGroupAddress {
  name: string,
  activeStartDate: Date,
  activeEndDate: Date,
  balance: DineroFactory.Dinero,
  amount: number,
  /** Undefined when not given; invalid (NaN) when unparsable. */
  invoiceDate?: Date,
}
