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
 * This is the module page of the audit-log-response.
 *
 * @module audit
 */

import BaseResponse from './base-response';
import { AuditAction, AuditEntityType } from '../../entity/audit/audit-log-entry';
import { BaseUserResponse } from './user-response';
import { PaginationResult } from '../../helpers/pagination';

/**
 * @typedef {allOf|BaseResponse} AuditLogEntryResponse
 * @property {BaseUserResponse} actor - The user that performed the mutation, absent
 * once that user has been removed
 * @property {string} actorName.required - The name the actor had at the time
 * @property {string} action.required - enum:invoice.create,invoice.update,invoice.delete,seller_payout.create,seller_payout.update,seller_payout.delete,payout_request.create,payout_request.update_status,write_off.create,transaction.update,transaction.delete,transfer.create,transfer.delete,product.create,product.update,product.delete,fine.handout,fine.delete,fine.delete_handout - The recorded mutation
 * @property {string} entityType.required - enum:Invoice,SellerPayout,PayoutRequest,WriteOff,Transaction,Transfer,Product,Fine,FineHandoutEvent - The kind of object that was mutated
 * @property {integer} entityId - The id of the object that was mutated
 * @property {object} changes - The fields that changed, keyed by field name
 */
export interface AuditLogEntryResponse extends BaseResponse {
  actor?: BaseUserResponse,
  actorName: string,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId?: number,
  changes?: Record<string, unknown>,
}

/**
 * @typedef {object} PaginatedAuditLogEntryResponse
 * @property {PaginationResult} _pagination.required - Pagination metadata
 * @property {Array.<AuditLogEntryResponse>} records.required - Returned audit log entries
 */
export interface PaginatedAuditLogEntryResponse {
  _pagination: PaginationResult,
  records: AuditLogEntryResponse[],
}
