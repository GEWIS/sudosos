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
 * @module debtors
 */

import BaseController, { BaseControllerOptions } from './base-controller';
import { Response } from 'express';
import log4js, { Logger } from 'log4js';
import Policy from './policy';
import { RequestWithToken } from '../middleware/token-middleware';
import { parseRequestPagination, toResponse } from '../helpers/pagination';
import DebtorService from '../service/debtor-service';
import User from '../entity/user/user';
import { asArrayOfDates, asArrayOfUserTypes, asDate, asFromAndTillDate, asReturnFileType } from '../helpers/validators';
import { In } from 'typeorm';
import { HandoutFinesRequest } from './request/debtor-request';
import Fine from '../entity/fine/fine';
import { ReturnFileType } from 'pdf-generator-client';
import { PdfError } from '../errors';
import FineHandoutEvent from '../entity/fine/fineHandoutEvent';
import AuditService from '../service/audit-service';
import { AuditAction, AuditEntityType } from '../entity/audit/audit-log-entry';
import { AppDataSource } from '../database/database';

/**
 * Controller for the `/fines` endpoints in the {@link debtors | debtors} module. Covers
 * the full handout pipeline (eligibility, warning, batch creation, undo) and the
 * treasurer-facing fine reports. Waiving lives on the user controller; see
 * {@link users!UserController.waiveUserFines | waiveUserFines} (`POST /users/<id>/fines/waive`).
 */
export default class DebtorController extends BaseController {
  private logger: Logger = log4js.getLogger(' DebtorController');

  public constructor(options: BaseControllerOptions) {
    super(options);
    this.configureLogger(this.logger);
  }

  public getPolicy(): Policy {
    return {
      '/': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'Fine', ['*']),
          handler: this.returnAllFineHandoutEvents.bind(this),
        },
      },
      '/:id(\\d+)': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'Fine', ['*']),
          handler: this.returnSingleFineHandoutEvent.bind(this),
        },
      },
      '/single/:id(\\d+)': {
        DELETE: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'delete', 'all', 'Fine', ['*']),
          handler: this.deleteFine.bind(this),
        },
      },
      '/eligible': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'Fine', ['*']),
          handler: this.calculateFines.bind(this),
        },
      },
      '/handout': {
        POST: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'create', 'all', 'Fine', ['*']),
          handler: this.handoutFines.bind(this),
          body: { modelName: 'HandoutFinesRequest' },
        },
      },
      '/handout/:id(\\d+)': {
        DELETE: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'delete', 'all', 'Fine', ['*']),
          handler: this.deleteFineHandout.bind(this),
        },
      },
      '/notify': {
        POST: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'notify', 'all', 'Fine', ['*']),
          handler: this.notifyAboutFutureFines.bind(this),
          body: { modelName: 'HandoutFinesRequest' },
        },
      },
      '/report': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'Fine', ['*']),
          handler: this.getFineReport.bind(this),
        },
      },
      '/report/pdf': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'Fine', ['*']),
          handler: this.getFineReportPdf.bind(this),
        },
      },
    };
  }

  /**
   * GET /fines
   * @summary Get all fine handout events
   * @tags debtors - Operations of the debtor controller
   * @operationId returnAllFineHandoutEvents
   * @security JWT
   * @param {integer} take.query - How many entries the endpoint should return
   * @param {integer} skip.query - How many entries should be skipped (for pagination)
   * @return {PaginatedFineHandoutEventResponse} 200 - All existing fine handout events
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async returnAllFineHandoutEvents(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('fine.list_handout_events');

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
      const [events, count] = await new DebtorService().getFineHandoutEvents({ take, skip });
      const records = events.map((e) => DebtorService.asBaseFineHandoutEventResponse(e));
      res.json(toResponse(records, count, { take, skip }));
    } catch (error) {
      this.logger.error('Could not return all fine handout event:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * GET /fines/{id}
   * @summary Get all fine handout events
   * @tags debtors - Operations of the debtor controller
   * @operationId returnSingleFineHandoutEvent
   * @security JWT
   * @param {integer} id.path.required - The id of the fine handout event which should be returned
   * @return {FineHandoutEventResponse} 200 - Requested fine handout event with corresponding fines
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async returnSingleFineHandoutEvent(req: RequestWithToken, res: Response): Promise<void> {
    const { id } = req.params;
    this.logger.trace('fine.get_handout_event', { id });

    try {
      const event = await new DebtorService().getSingleFineHandoutEvent(Number.parseInt(id, 10));
      if (!event) {
        res.status(404).json('Fine handout event not found.');
        return;
      }
      res.json(DebtorService.asFineHandoutEventResponse(event));
    } catch (error) {
      this.logger.error('Could not return fine handout event:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * DELETE /fines/single/{id}
   * @summary Delete a fine
   * @tags debtors - Operations of the debtor controller
   * @operationId deleteFine
   * @security JWT
   * @param {integer} id.path.required - The id of the fine which should be deleted
   * @return 204 - Success
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async deleteFine(req: RequestWithToken, res: Response): Promise<void> {
    const { id } = req.params;
    this.logger.trace('fine.delete', { id });

    try {
      const parsedId = Number.parseInt(id, 10);
      // userFineGroup is loaded so the audit entry can record whose fine this was.
      const fine = await Fine.findOne({
        where: { id: parsedId },
        relations: { userFineGroup: true },
      });
      if (fine == null) {
        res.status(404).send();
        return;
      }

      await AppDataSource.manager.transaction(async (manager) => {
        await new DebtorService(manager).deleteFine(parsedId);
        await new AuditService(manager).log(req.token.user, {
          action: AuditAction.FINE_DELETE,
          entityType: AuditEntityType.FINE,
          entityId: parsedId,
          changes: { userId: fine.userFineGroup.userId, amount: fine.amount.toObject() },
        });
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Could not return fine handout event:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * GET /fines/eligible
   * @summary Return all users that had at most -5 euros balance both now and on the reference date.
   *    For all these users, also return their fine based on the reference date.
   * @tags debtors - Operations of the debtor controller
   * @operationId calculateFines
   * @security JWT
   * @param {Array<string>} userTypes.query - List of all user types fines should be calculated for (MEMBER, ORGAN, VOUCHER, LOCAL_USER, LOCAL_ADMIN, INVOICE, AUTOMATIC_INVOICE).
   * @param {Array<string>} referenceDates.query.required - Dates to base the fines on. Every returned user has at
   *    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
   * @return {Array<UserToFineResponse>} 200 - List of eligible fines
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async calculateFines(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('fine.calculate');

    let params;
    try {
      if (req.query.referenceDates === undefined) throw new Error('referenceDates is required');
      const referenceDates = asArrayOfDates(req.query.referenceDates);
      if (referenceDates === undefined) throw new Error('referenceDates is not a valid array');
      params = {
        userTypes: asArrayOfUserTypes(req.query.userTypes),
        referenceDates,
      };
      if (params.userTypes === undefined && req.query.userTypes !== undefined) throw new Error('userTypes is not a valid array of UserTypes');
    } catch (e) {
      res.status(400).json(e.message);
      return;
    }

    try {
      res.json(await new DebtorService().calculateFinesOnDate(params));
    } catch (error) {
      this.logger.error('Could not calculate fines:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * POST /fines/handout
   * @summary Handout fines to all given users. Fines will be handed out "now" to prevent rewriting history.
   * @tags debtors - Operations of the debtor controller
   * @operationId handoutFines
   * @security JWT
   * @param {HandoutFinesRequest} request.body.required
   * @return {FineHandoutEventResponse} 200 - Created fine handout event with corresponding fines
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async handoutFines(req: RequestWithToken, res: Response): Promise<void> {
    const body = req.body as HandoutFinesRequest;
    this.logger.trace('fine.handout', { request: body });

    let referenceDate: Date;
    try {
      // Todo: write code-consistent validator (either /src/controller/request/validators or custom validator.js function)
      if (!Array.isArray(body.userIds)) throw new Error('userIds is not an array');
      const users = await User.find({ where: { id: In(body.userIds) } });
      if (users.length !== body.userIds.length) throw new Error('userIds is not a valid array of user IDs');

      if (body.referenceDate !== undefined) {
        referenceDate = asDate(body.referenceDate);
      }
    } catch (e) {
      res.status(400).json(e.message);
      return;
    }

    let event;
    try {
      event = await new DebtorService().handOutFines({ referenceDate, userIds: body.userIds }, req.token.user);
    } catch (error) {
      this.logger.error('Could not handout fines:', error);
      res.status(500).json('Internal server error.');
      return;
    }

    // handOutFines already committed and notified affected users by this point (it opens
    // its own transaction and emails on success), so a failing audit write must not turn
    // this into a 500: that would invite a retry that hands out a second round of fines.
    // Log loudly instead and still report success.
    try {
      await new AuditService().log(req.token.user, {
        action: AuditAction.FINE_HANDOUT,
        entityType: AuditEntityType.FINE_HANDOUT_EVENT,
        entityId: event.id,
        changes: { userIds: body.userIds, referenceDate: body.referenceDate },
      });
    } catch (error) {
      this.logger.error(`Fine handout ${event.id} succeeded but its audit entry failed to record:`, error);
    }

    res.json(DebtorService.asFineHandoutEventResponse(event));
  }

  /**
   * DELETE /fines/handout/{id}
   * @summary Delete a fine handout event
   * @tags debtors - Operations of the debtor controller
   * @operationId deleteFineHandout
   * @security JWT
   * @param {integer} id.path.required - The id of the fine handout event which should be deleted
   * @return 204 - Success
   * @return {string} 400 - Validation error
   * @return {string} 404 - Not found error
   * @return {string} 500 - Internal server error
   */
  public async deleteFineHandout(req: RequestWithToken, res: Response): Promise<void> {
    const { id } = req.params;
    this.logger.trace('fine.delete_handout', { id });

    try {
      const parsedId = Number.parseInt(id, 10);
      const event = await FineHandoutEvent.findOne({ where: { id: parsedId }, relations: {
        fines: true,
      } });
      if (event == null) {
        res.status(404).send();
        return;
      }

      await AppDataSource.manager.transaction(async (manager) => {
        await new DebtorService(manager).deleteFineHandout(event);
        await new AuditService(manager).log(req.token.user, {
          action: AuditAction.FINE_HANDOUT_DELETE,
          entityType: AuditEntityType.FINE_HANDOUT_EVENT,
          entityId: parsedId,
          changes: { fineCount: event.fines.length },
        });
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Could not delete fine handout:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * POST /fines/notify
   * @summary Send an email to all given users about their possible future fine.
   * @tags debtors - Operations of the debtor controller
   * @operationId notifyAboutFutureFines
   * @security JWT
   * @param {HandoutFinesRequest} request.body.required
   * @return 204 - Success
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async notifyAboutFutureFines(req: RequestWithToken, res: Response): Promise<void> {
    const body = req.body as HandoutFinesRequest;
    this.logger.trace('fine.notify_future', { request: body });

    let referenceDate: Date;
    try {
      // Todo: write code-consistent validator (either /src/controller/request/validators or custom validator.js function)
      if (!Array.isArray(body.userIds)) throw new Error('userIds is not an array');
      const users = await User.find({ where: { id: In(body.userIds) } });
      if (users.length !== body.userIds.length) throw new Error('userIds is not a valid array of user IDs');

      if (body.referenceDate !== undefined) {
        referenceDate = asDate(body.referenceDate);
      }
    } catch (e) {
      res.status(400).json(e.message);
      return;
    }

    try {
      await new DebtorService().sendFineWarnings({ referenceDate, userIds: body.userIds });
      res.status(204).send();
    } catch (error) {
      this.logger.error('Could not send future fine notification emails:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * GET /fines/report
   * @summary Get a report of all fines
   * @tags debtors - Operations of the debtor controller
   * @operationId getFineReport
   * @security JWT
   * @param {string} fromDate.query - The start date of the report, inclusive
   * @param {string} toDate.query - The end date of the report, exclusive
   * @return {FineReportResponse} 200 - The requested report
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async getFineReport(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('fine.get_report');

    let fromDate, toDate;
    try {
      const filters = asFromAndTillDate(req.query.fromDate, req.query.toDate);
      fromDate = filters.fromDate;
      toDate = filters.tillDate;
    } catch (e) {
      res.status(400).json(e.message);
      return;
    }

    try {
      const report = await new DebtorService().getFineReport(fromDate, toDate);
      res.json(report.toResponse());
    } catch (error) {
      this.logger.error('Could not get fine report:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * GET /fines/report/pdf
   * @summary Get a report of all fines in pdf format
   * @tags debtors - Operations of the debtor controller
   * @operationId getFineReportPdf
   * @security JWT
   * @param {string} fromDate.query.required - The start date of the report, inclusive
   * @param {string} toDate.query.required - The end date of the report, exclusive
   * @param {string} fileType.query.required - enum:PDF,TEX - The file type of the report
   * @returns {string} 200 - The requested report - application/pdf
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async getFineReportPdf(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('fine.get_report_pdf');

    let fromDate, toDate;
    let fileType: ReturnFileType;
    try {
      const filters = asFromAndTillDate(req.query.fromDate, req.query.toDate);
      fromDate = filters.fromDate;
      toDate = filters.tillDate;
      fileType = asReturnFileType(req.query.fileType);
    } catch (e) {
      res.status(400).json(e.message);
      return;
    }

    try {
      const report = await new DebtorService().getFineReport(fromDate, toDate);

      const buffer = fileType === 'PDF' ? await report.createPdf() : await report.createRaw();
      const from = `${fromDate.getFullYear()}${fromDate.getMonth() + 1}${fromDate.getDate()}`;
      const to = `${toDate.getFullYear()}${toDate.getMonth() + 1}${toDate.getDate()}`;
      const fileName = `fine-report-${from}-${to}.${fileType}`;

      res.setHeader('Content-Type', 'application/pdf+tex');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error) {
      this.logger.error('Could not get fine report pdf:', error);
      if (error instanceof PdfError) {
        res.status(502).json('PDF Generator service failed.');
        return;
      }
      res.status(500).json('Internal server error.');
    }
  }

}
