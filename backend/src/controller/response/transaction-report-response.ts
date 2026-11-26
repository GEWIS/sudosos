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
 * This is the module page of the transaction-report-response.
 *
 * @module reports
 */

/**
 * @typedef {object} TransactionFilterParameters
 * @property {Array<integer>} transactionId
 * @property {number} fromId
 * @property {number} createdById
 * @property {number} toId
 * @property {boolean} exclusiveToId
 * @property {number} pointOfSaleId
 * @property {number} pointOfSaleRevision
 * @property {number} containerId
 * @property {number} containerRevision
 * @property {number} productId
 * @property {number} productRevision
 * @property {string} fromDate
 * @property {string} tillDate
 * @property {number} invoiceId
 */
