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

import { DineroObjectResponse } from './dinero-response';

/**
 * @typedef {object} WrappedResponse
 * @property {integer} userId.required - The ID of the user
 * @property {integer} year.required - The year the statistics are about
 * @property {WrappedTransactions} transactions.required - The wrapped transactions info of the user
 * @property {DineroObjectResponse} totalSpent.required - The amount of money the user spent
 * @property {DineroObjectResponse} previousTotalSpent.required - The amount of money the user spent in the year before
 * @property {DineroObjectResponse} borrelSpent.required - The part of totalSpent spent at points of sale without authentication
 * @property {number} spentPercentile.required - The top percentile of the user based on amount spent
 * @property {Array.<WrappedProductResponse>} topProducts.required - The most bought products, most bought first
 * @property {Array.<WrappedCategoryResponse>} categories.required - The money spent per product category, highest first
 * @property {string} syncedFrom.required - The starting date from which the data was considered
 * @property {string} syncedTo.required - The last time the data was synced
 * @property {Array.<WrappedOrganMemberResponse>} organs.required - Organ member statistics for the user
 */
export default interface WrappedResponse {
  userId: number;
  year: number;
  transactions: WrappedTransactions;
  totalSpent: DineroObjectResponse;
  previousTotalSpent: DineroObjectResponse;
  borrelSpent: DineroObjectResponse;
  spentPercentile: number;
  topProducts: WrappedProductResponse[];
  categories: WrappedCategoryResponse[];
  syncedFrom: string;
  syncedTo: string;
  organs: WrappedOrganMemberResponse[];
}

/**
 * @typedef {object} WrappedTransactions
 * @property {integer} transactionCount.required - The total number of transaction in the past year
 * @property {integer} previousTransactionCount.required - The total number of transactions in the year before
 * @property {number} transactionPercentile.required - The top percentile of the user based on the amount of transactions
 * @property {string} transactionMaxDate - The day on which the user made the most transactions, omitted without transactions
 * @property {number} transactionMaxAmount.required - The highest amount of transactions made by the user on a single day
 * @property {Array.<integer>} transactionHeatmap.required - Heatmap data representing transaction activity over the year
 */
export interface WrappedTransactions {
  transactionCount: number;
  previousTransactionCount: number;
  transactionPercentile: number;
  transactionMaxDate?: string;
  transactionMaxAmount: number;
  transactionHeatmap: number[];
}

/**
 * @typedef {object} WrappedProductResponse
 * @property {integer} id.required - The ID of the product
 * @property {string} name.required - The current name of the product
 * @property {string} image - The download name of the image of the product
 * @property {integer} count.required - The number of times the user bought the product
 * @property {DineroObjectResponse} totalInclVat.required - The amount of money the user spent on the product
 * @property {integer} rank.required - The 1-based rank of the user among the buyers of the product
 */
export interface WrappedProductResponse {
  id: number;
  name: string;
  image?: string;
  count: number;
  totalInclVat: DineroObjectResponse;
  rank: number;
}

/**
 * @typedef {object} WrappedCategoryResponse
 * @property {integer} id.required - The ID of the product category
 * @property {string} name.required - The name of the product category
 * @property {DineroObjectResponse} totalInclVat.required - The amount of money the user spent in the category
 */
export interface WrappedCategoryResponse {
  id: number;
  name: string;
  totalInclVat: DineroObjectResponse;
}

/**
 * @typedef {object} WrappedOrganMemberResponse
 * @property {integer} organId.required - The ID of the organ
 * @property {integer} ordinalTransactionCreated.required - 0-based ranking for transaction count created
 * @property {integer} ordinalTurnoverCreated.required - 0-based ranking for turnover amount created
 */
export interface WrappedOrganMemberResponse {
  organId: number;
  ordinalTransactionCreated: number;
  ordinalTurnoverCreated: number;
}