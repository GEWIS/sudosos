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
 * This is the module page of the tab controller.
 *
 * @module tabs
 */

import log4js, { Logger } from 'log4js';
import { Response } from 'express';
import BaseController, { BaseControllerOptions } from './base-controller';
import Policy from './policy';
import { RequestWithToken } from '../middleware/token-middleware';
import { AppDataSource } from '../database/database';
import TabService, {
  TabNotFoundError, TabStateError, TerminalNotFoundError, TerminalUnavailableError,
} from '../service/tab-service';
import Tab, { TabStatus } from '../entity/tab/tab';
import User, { UserType } from '../entity/user/user';
import UserService from '../service/user-service';
import PointOfSale from '../entity/point-of-sale/point-of-sale';
import PointOfSaleRevision from '../entity/point-of-sale/point-of-sale-revision';
import { CreateTabRequest, PayTabRequest, UpdateTabRequest } from './request/tab-request';
import { TabResponse } from './response/tab-response';
import { PdfUrlResponse } from './response/simple-file-response';
import { parseRequestPagination, toResponse } from '../helpers/pagination';
import TabReceiptPdfService from '../service/pdf/tab-receipt-pdf-service';
import WebSocketService from '../service/websocket-service';
import { PdfError } from '../errors';
import Config from '../config';

const MAX_FIELD_LENGTH = 64;

function isField(value: unknown, maxLength = MAX_FIELD_LENGTH): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function trimFields<T extends object>(body: T, ...keys: (keyof T)[]) {
  keys.forEach((k) => {
    if (typeof body[k] === 'string') body[k] = (body[k] as string).trim() as T[keyof T];
  });
}

/** A loose email check: the mail server is the real judge. */
function isEmail(value: unknown): value is string {
  return isField(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default class TabController extends BaseController {
  private logger: Logger = log4js.getLogger('TabController');

  public constructor(options: BaseControllerOptions) {
    super(options);
    this.configureLogger(this.logger);
  }

  /**
   * @inheritDoc
   */
  public getPolicy(): Policy {
    return {
      '/': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'Tab', ['*']),
          handler: this.getTabs.bind(this),
        },
        POST: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'create', 'all', 'Tab', ['*']),
          handler: this.createTab.bind(this),
          body: { modelName: 'CreateTabRequest' },
        },
      },
      '/:id(\\d+)': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'Tab', ['*']),
          handler: this.getSingleTab.bind(this),
        },
        PATCH: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'update', 'all', 'Tab', ['*']),
          handler: this.updateTab.bind(this),
          body: { modelName: 'UpdateTabRequest' },
        },
        DELETE: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'delete', 'all', 'Tab', ['*']),
          handler: this.cancelTab.bind(this),
        },
      },
      '/:id(\\d+)/payment': {
        POST: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'pay', 'all', 'Tab', ['*']),
          handler: this.startPayment.bind(this),
          body: { modelName: 'PayTabRequest' },
        },
        DELETE: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'pay', 'all', 'Tab', ['*']),
          handler: this.cancelPayment.bind(this),
        },
      },
      '/:id(\\d+)/receipt': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'Tab', ['*']),
          handler: this.getReceipt.bind(this),
        },
      },
      '/:id(\\d+)/receipt/send': {
        POST: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'update', 'all', 'Tab', ['*']),
          handler: this.sendReceipt.bind(this),
        },
      },
      '/:id(\\d+)/convert-to-invoice-account': {
        POST: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'update', 'all', 'Tab', ['*'])
            && this.roleManager.can(req.token.roles, 'create', 'all', 'Invoice', ['*']),
          handler: this.convertToInvoiceAccount.bind(this),
        },
      },
    };
  }

  /**
   * Respond to an error thrown by the tab service.
   */
  private handleError(res: Response, event: string, error: unknown) {
    if (error instanceof TabNotFoundError) {
      res.status(404).json('Tab not found.');
      return;
    }
    if (error instanceof TerminalNotFoundError) {
      res.status(400).json(error.message);
      return;
    }
    if (error instanceof TerminalUnavailableError) {
      res.status(422).json('Terminal unavailable (is it in use?)');
      return;
    }
    if (error instanceof TabStateError) {
      res.status(409).json(error.message);
      return;
    }
    if (error instanceof PdfError) {
      res.status(502).json('PDF Generator service failed.');
      return;
    }
    this.logger.error(event, error);
    res.status(500).json('Internal server error.');
  }

  /**
   * Whether the point of sale that the given `POINT_OF_SALE` user belongs to
   * is in borrel mode: its current revision does not make people log in.
   * @param posUserId - ID of the point of sale's own user.
   */
  private static async isBorrelModePos(posUserId: number): Promise<boolean> {
    const pos = await PointOfSale.findOne({ where: { user: { id: posUserId } } });
    if (!pos) return false;
    const revision = await PointOfSaleRevision.findOne({
      where: { pointOfSale: { id: pos.id }, revision: pos.currentRevision },
    });
    return revision?.useAuthentication === false;
  }

  /**
   * Find the tab from the `id` path parameter, or respond with 404.
   */
  private async findTab(req: RequestWithToken, res: Response): Promise<Tab | undefined> {
    const tab = await new TabService().getTab(parseInt(req.params.id, 10));
    if (!tab) {
      res.status(404).json('Tab not found.');
      return undefined;
    }
    return tab;
  }

  private static async getRequestUser(req: RequestWithToken): Promise<User> {
    const user = await User.findOne(UserService.getOptions({ id: req.token.user.id, allowPos: true }));
    if (!user) throw new Error(`User "${req.token.user.id}" of the token not found.`);
    return user;
  }

  /**
   * Tell the subscribers of a tab about its new state. Only call this after
   * the change has been committed. Failures are logged and swallowed.
   */
  private async emitUpdate(tab: TabResponse) {
    try {
      await WebSocketService.emitTabUpdated(tab);
    } catch (error) {
      this.logger.error('tab.emit_update.failed', { tabId: tab.id }, error);
    }
  }

  /**
   * GET /tabs
   * @summary Returns all tabs, newest first
   * @operationId getAllTabs
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {string} status.query - enum:OPEN,LOCKED,PAID,INVOICED,CANCELLED - Only return tabs with this status
   * @param {integer} take.query - How many tabs the endpoint should return
   * @param {integer} skip.query - How many tabs should be skipped (for pagination)
   * @return {PaginatedTabResponse} 200 - The requested tabs
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async getTabs(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('tab.list', { query: req.query });

    let take;
    let skip;
    let status: TabStatus | undefined;
    try {
      const pagination = parseRequestPagination(req);
      take = pagination.take;
      skip = pagination.skip;
      if (req.query.status !== undefined) {
        status = req.query.status as TabStatus;
        if (!Object.values(TabStatus).includes(status)) throw new Error(`Invalid status "${status}".`);
      }
    } catch (e) {
      res.status(400).json(e.message);
      return;
    }

    try {
      const service = new TabService();
      const [tabs, count] = await service.getTabs({ status }, { take, skip });
      const records = await service.toResponses(tabs);
      res.status(200).json(toResponse(records, count, { take, skip }));
    } catch (error) {
      this.handleError(res, 'tab.list.failed', error);
    }
  }

  /**
   * POST /tabs
   * @summary Opens a new tab for a group
   * @operationId createTab
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {CreateTabRequest} request.body.required - The tab to open
   * @return {TabResponse} 200 - The opened tab
   * @return {string} 400 - Validation error
   * @return {string} 403 - Called from a point of sale that is not in borrel mode
   * @return {string} 500 - Internal server error
   */
  public async createTab(req: RequestWithToken, res: Response): Promise<void> {
    const body = req.body as CreateTabRequest;
    this.logger.trace('tab.create', { name: body.name });
    trimFields(body, 'name', 'contactName', 'contactEmail');

    if (!isField(body.name) || !isField(body.contactName) || !isEmail(body.contactEmail)
      || typeof body.ofAge !== 'boolean') {
      res.status(400).json(`Name, contact name and a valid contact email (at most ${MAX_FIELD_LENGTH} characters each) and ofAge are required.`);
      return;
    }

    try {
      // Tabs are opened at the borrel-mode point of sale only. A point of sale
      // where people log in themselves must not open them.
      if (req.token.user.type === UserType.POINT_OF_SALE
        && !(await TabController.isBorrelModePos(req.token.user.id))) {
        res.status(403).json('Tabs can only be opened at a point of sale in borrel mode.');
        return;
      }

      const createdBy = await TabController.getRequestUser(req);
      let response: TabResponse;
      await AppDataSource.transaction(async (manager) => {
        const service = new TabService(manager);
        response = await service.toResponse(await service.createTab(body, createdBy));
      });
      await this.emitUpdate(response);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, 'tab.create.failed', error);
    }
  }

  /**
   * GET /tabs/{id}
   * @summary Returns a single tab
   * @operationId getSingleTab
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {integer} id.path.required - The id of the tab
   * @return {TabResponse} 200 - The requested tab
   * @return {string} 404 - Tab not found
   * @return {string} 500 - Internal server error
   */
  public async getSingleTab(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('tab.get', { id: req.params.id });
    try {
      const tab = await this.findTab(req, res);
      if (!tab) return;
      res.status(200).json(await new TabService().toResponse(tab));
    } catch (error) {
      this.handleError(res, 'tab.get.failed', error);
    }
  }

  /**
   * PATCH /tabs/{id}
   * @summary Updates the name or contact details of an open tab
   * @operationId updateTab
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {integer} id.path.required - The id of the tab
   * @param {UpdateTabRequest} request.body.required - The fields to update
   * @return {TabResponse} 200 - The updated tab
   * @return {string} 400 - Validation error
   * @return {string} 404 - Tab not found
   * @return {string} 409 - Tab is not open
   * @return {string} 500 - Internal server error
   */
  public async updateTab(req: RequestWithToken, res: Response): Promise<void> {
    const body = req.body as UpdateTabRequest;
    this.logger.trace('tab.update', { id: req.params.id });
    trimFields(body, 'name', 'contactName', 'contactEmail');

    if (body.name === undefined && body.contactName === undefined && body.contactEmail === undefined) {
      res.status(400).json('Nothing to update: give a name, contact name or contact email.');
      return;
    }
    if ((body.name !== undefined && !isField(body.name))
      || (body.contactName !== undefined && !isField(body.contactName))
      || (body.contactEmail !== undefined && !isEmail(body.contactEmail))) {
      res.status(400).json(`Name, contact name and contact email must be non-empty and at most ${MAX_FIELD_LENGTH} characters, and the email must be valid.`);
      return;
    }

    try {
      let response: TabResponse;
      await AppDataSource.transaction(async (manager) => {
        const service = new TabService(manager);
        response = await service.toResponse(await service.updateTab(parseInt(req.params.id, 10), body));
      });
      await this.emitUpdate(response);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, 'tab.update.failed', error);
    }
  }

  /**
   * DELETE /tabs/{id}
   * @summary Cancels an open tab that nothing was bought on
   * @operationId cancelTab
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {integer} id.path.required - The id of the tab
   * @return {TabResponse} 200 - The cancelled tab
   * @return {string} 404 - Tab not found
   * @return {string} 409 - Tab is not open, or has a nonzero balance
   * @return {string} 500 - Internal server error
   */
  public async cancelTab(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('tab.cancel', { id: req.params.id });
    try {
      let response: TabResponse;
      await AppDataSource.transaction(async (manager) => {
        const service = new TabService(manager);
        response = await service.toResponse(await service.cancelTab(parseInt(req.params.id, 10)));
      });
      await this.emitUpdate(response);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, 'tab.cancel.failed', error);
    }
  }

  /**
   * POST /tabs/{id}/payment
   * @summary Charges the outstanding amount of a tab on a Stripe Terminal
   * @operationId startTabPayment
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {integer} id.path.required - The id of the tab
   * @param {PayTabRequest} request.body.required - The terminal to pay on
   * @return {TabResponse} 200 - The tab, now LOCKED
   * @return {string} 400 - Terminal not found
   * @return {string} 404 - Tab not found
   * @return {string} 403 - Called from a point of sale that is not in borrel mode
   * @return {string} 409 - Tab is not open, or has nothing to pay, or the payment was cancelled while starting
   * @return {string} 422 - Terminal is busy with another payment
   * @return {string} 502 - The terminal could not start the payment
   * @return {string} 503 - Card payments are not enabled on this server
   * @return {string} 500 - Internal server error
   */
  public async startPayment(req: RequestWithToken, res: Response): Promise<void> {
    const body = req.body as PayTabRequest;
    this.logger.trace('tab.payment.start', { id: req.params.id, terminal: body.stripeTerminalId });

    if (!Config.get().stripe.enabled) {
      res.status(503).json('Card payments are not enabled on this server.');
      return;
    }
    if (!isField(body.stripeTerminalId)) {
      res.status(400).json('stripeTerminalId is required.');
      return;
    }
    // Tabs are paid at the borrel-mode point of sale only.
    if (req.token.user.type === UserType.POINT_OF_SALE
      && !(await TabController.isBorrelModePos(req.token.user.id))) {
      res.status(403).json('Tabs can only be paid at a point of sale in borrel mode.');
      return;
    }

    const id = parseInt(req.params.id, 10);
    try {
      await AppDataSource.transaction(async (manager) => {
        await new TabService(manager).startPayment(id, body.stripeTerminalId);
      });
    } catch (error) {
      this.handleError(res, 'tab.payment.start.failed', error);
      return;
    }

    // Only once the payment is recorded, tell the reader to collect it. If the
    // reader refuses, the service cancels the payment and reopens the tab.
    let collected = false;
    let collectError: unknown;
    try {
      await AppDataSource.transaction(async (manager) => {
        collected = await new TabService(manager).collectOnTerminal(id);
      });
    } catch (error) {
      collectError = error;
    }

    try {
      const service = new TabService();
      const response = await service.toResponse((await service.getTab(id))!);
      await this.emitUpdate(response);

      if (collected) {
        res.status(200).json(response);
      } else if (collectError instanceof TabStateError) {
        // Cancelled meanwhile, or the reader refused but the payment can no
        // longer be cancelled.
        res.status(409).json(collectError.message);
      } else {
        if (collectError) this.logger.error('tab.payment.collect.failed', { id }, collectError);
        res.status(502).json(response.status === TabStatus.OPEN
          ? 'The terminal could not start the payment. The tab is open again.'
          : 'The terminal could not start the payment, and the payment could not be cancelled. Cancel it before trying again.');
      }
    } catch (error) {
      this.handleError(res, 'tab.payment.start.failed', error);
    }
  }

  /**
   * DELETE /tabs/{id}/payment
   * @summary Cancels the terminal payment in progress and reopens the tab
   * @operationId cancelTabPayment
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {integer} id.path.required - The id of the tab
   * @return {TabResponse} 200 - The tab, OPEN again
   * @return {string} 404 - Tab not found
   * @return {string} 409 - No payment is in progress, or it can no longer be cancelled because it was just completed
   * @return {string} 503 - Card payments are not enabled on this server
   * @return {string} 500 - Internal server error
   */
  public async cancelPayment(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('tab.payment.cancel', { id: req.params.id });
    if (!Config.get().stripe.enabled) {
      res.status(503).json('Card payments are not enabled on this server.');
      return;
    }
    try {
      let response: TabResponse;
      await AppDataSource.transaction(async (manager) => {
        const service = new TabService(manager);
        response = await service.toResponse(await service.cancelPayment(parseInt(req.params.id, 10)));
      });
      await this.emitUpdate(response);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, 'tab.payment.cancel.failed', error);
    }
  }

  /**
   * GET /tabs/{id}/receipt
   * @summary Returns the receipt PDF of a paid tab
   * @operationId getTabReceipt
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {integer} id.path.required - The id of the tab
   * @return {PdfUrlResponse} 200 - The pdf location information
   * @return {string} 404 - Tab not found
   * @return {string} 409 - Tab is not paid
   * @return {string} 502 - PDF generator service failed
   * @return {string} 500 - Internal server error
   */
  public async getReceipt(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('tab.receipt.get', { id: req.params.id });
    try {
      const tab = await this.findTab(req, res);
      if (!tab) return;
      if (tab.status !== TabStatus.PAID) {
        res.status(409).json('Only a paid tab has a receipt.');
        return;
      }
      const pdf = await new TabReceiptPdfService().getOrCreate(tab);
      res.status(200).json({ pdf: pdf.downloadName } as PdfUrlResponse);
    } catch (error) {
      this.handleError(res, 'tab.receipt.get.failed', error);
    }
  }

  /**
   * POST /tabs/{id}/receipt/send
   * @summary Emails the receipt of a paid tab to its contact person (again)
   * @operationId sendTabReceipt
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {integer} id.path.required - The id of the tab
   * @return 204 - Receipt sent
   * @return {string} 404 - Tab not found
   * @return {string} 409 - Tab is not paid
   * @return {string} 502 - PDF generator service failed
   * @return {string} 500 - Internal server error
   */
  public async sendReceipt(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('tab.receipt.send', { id: req.params.id });
    try {
      const tab = await this.findTab(req, res);
      if (!tab) return;
      await new TabService().sendReceipt(tab);
      res.status(204).send();
    } catch (error) {
      this.handleError(res, 'tab.receipt.send.failed', error);
    }
  }

  /**
   * POST /tabs/{id}/convert-to-invoice-account
   * @summary Converts an unpaid tab into an invoice account
   * @description The tab user becomes an INVOICE user. It keeps its transactions, which can then be
   * invoiced with the regular invoice endpoints. The invoice account has no default address: the
   * address is entered when the invoice is created.
   * @operationId convertTabToInvoiceAccount
   * @tags tabs - Operations of the tab controller
   * @security JWT
   * @param {integer} id.path.required - The id of the tab
   * @return {TabResponse} 200 - The tab, now INVOICED
   * @return {string} 404 - Tab not found
   * @return {string} 409 - Tab is not open, or has nothing to invoice
   * @return {string} 500 - Internal server error
   */
  public async convertToInvoiceAccount(req: RequestWithToken, res: Response): Promise<void> {
    this.logger.trace('tab.convert_to_invoice', { id: req.params.id });

    try {
      const by = await TabController.getRequestUser(req);
      let response: TabResponse;
      await AppDataSource.transaction(async (manager) => {
        const service = new TabService(manager);
        response = await service.toResponse(
          await service.convertToInvoiceAccount(parseInt(req.params.id, 10), by),
        );
      });
      await this.emitUpdate(response);
      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, 'tab.convert_to_invoice.failed', error);
    }
  }
}
