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
 * This is the module page of the audit controller.
 *
 * @module audit
 */

import log4js, { Logger } from 'log4js';
import { Response } from 'express';
import BaseController, { BaseControllerOptions } from './base-controller';
import Policy from './policy';
import { RequestWithToken } from '../middleware/token-middleware';
import AuditService, { parseAuditLogFilterParameters } from '../service/audit-service';
import { parseRequestPagination, toResponse } from '../helpers/pagination';

/**
 * The audit log controller.
 */
export default class AuditController extends BaseController {
  private logger: Logger = log4js.getLogger('AuditController');

  /**
   * Creates a new audit controller instance.
   * @param options - The options passed to the base controller.
   */
  public constructor(options: BaseControllerOptions) {
    super(options);
    this.configureLogger(this.logger);
  }

  /**
   * @inheritDoc
   */
  getPolicy(): Policy {
    return {
      '/': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'AuditLog', ['*']),
          handler: this.returnAllAuditLogEntries.bind(this),
        },
      },
    };
  }

  /**
   * GET /audit-logs
   * @summary Returns the recorded financial mutations, newest first.
   * @operationId getAllAuditLogEntries
   * @tags audit-logs - Operations of the audit log controller
   * @security JWT
   * @param {integer} actorId.query - Filter on the user that performed the mutation
   * @param {string} action.query - enum:invoice.create,invoice.update,invoice.delete,seller_payout.create,seller_payout.update,seller_payout.delete,payout_request.create,payout_request.update_status,write_off.create,transaction.update,transaction.delete,transfer.create,transfer.delete,product.create,product.update,product.delete,fine.handout,fine.delete,fine.delete_handout - Filter on the recorded mutation
   * @param {string} entityType.query - enum:Invoice,SellerPayout,PayoutRequest,WriteOff,Transaction,Transfer,Product,Fine,FineHandoutEvent - Filter on the kind of object that was mutated
   * @param {integer} entityId.query - Filter on the id of the object that was mutated
   * @param {integer} take.query - Number of entries to return
   * @param {integer} skip.query - Number of entries to skip
   * @return {PaginatedAuditLogEntryResponse} 200 - The recorded mutations
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async returnAllAuditLogEntries(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('audit_log.list', { query: req.query });

    let take;
    let skip;
    try {
      const pagination = parseRequestPagination(req);
      take = pagination.take;
      skip = pagination.skip;
    } catch (e) {
      res.status(400).json(e.message);
      return;
    }

    try {
      const filters = parseAuditLogFilterParameters(req);
      const [entries, count] = await new AuditService().getAuditLogEntries(filters, { take, skip });
      res.json(toResponse(
        entries.map(AuditService.asAuditLogEntryResponse), count, { take, skip },
      ));
    } catch (error) {
      this.logger.error('Could not return audit log entries:', error);
      res.status(500).json('Internal server error.');
    }
  }
}
