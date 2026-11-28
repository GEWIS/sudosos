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
 * This is the module page of the tab-request.
 *
 * @module tabs
 */

/**
 * @typedef {object} CreateTabRequest
 * @property {string} name.required - Name of the tab, shown at the point of sale.
 * @property {string} contactName.required - Name of the contact person of the group.
 * @property {string} contactEmail.required - Email address the receipt is sent to.
 * @property {boolean} ofAge.required - Whether the group may buy age-restricted products.
 */
export interface CreateTabRequest {
  name: string;
  contactName: string;
  contactEmail: string;
  ofAge: boolean;
}

/**
 * @typedef {object} UpdateTabRequest
 * @property {string} name - Name of the tab, shown at the point of sale.
 * @property {string} contactName - Name of the contact person of the group.
 * @property {string} contactEmail - Email address the receipt is sent to.
 */
export interface UpdateTabRequest {
  name?: string;
  contactName?: string;
  contactEmail?: string;
}

/**
 * @typedef {object} PayTabRequest
 * @property {string} stripeTerminalId.required - ID of the Stripe Terminal (reader) to pay on.
 */
export interface PayTabRequest {
  stripeTerminalId: string;
}
