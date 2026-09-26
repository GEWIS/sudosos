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
 * This is the module page of the voucher-group-controller.
 *
 * @module vouchers
 */

import { Response } from 'express';
import log4js, { Logger } from 'log4js';
import BaseController, { BaseControllerOptions } from './base-controller';
import Policy from './policy';
import { VoucherGroupAddressRequest, VoucherGroupRequest } from './request/voucher-group-request';
import { RequestWithToken } from '../middleware/token-middleware';
import VoucherGroup from '../entity/user/voucher-group';
import VoucherGroupService from '../service/voucher-group-service';
import { parseRequestPagination, toResponse } from '../helpers/pagination';
import { MissingAddressError, PdfError } from '../errors';
import { PdfUrlResponse } from './response/simple-file-response';

export default class VoucherGroupController extends BaseController {
  private logger: Logger = log4js.getLogger('VoucherGroupController');

  public constructor(options: BaseControllerOptions) {
    super(options);
    this.configureLogger(this.logger);
  }

  /**
   * @inheritdoc
   */
  public getPolicy(): Policy {
    return {
      '/': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'VoucherGroup', ['*']),
          handler: this.getAllVoucherGroups.bind(this),
        },
        POST: {
          body: { modelName: 'VoucherGroupRequest' },
          policy: async (req) => this.roleManager.can(req.token.roles, 'create', 'all', 'VoucherGroup', ['*']),
          handler: this.createVoucherGroup.bind(this),
        },
      },
      '/:id(\\d+)': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'VoucherGroup', ['*']),
          handler: this.getVoucherGroupById.bind(this),
        },
        PATCH: {
          body: { modelName: 'VoucherGroupRequest' },
          policy: async (req) => this.roleManager.can(req.token.roles, 'update', 'all', 'VoucherGroup', ['*']),
          handler: this.updateVoucherGroup.bind(this),
        },
      },
      '/:id(\\d+)/address': {
        PATCH: {
          body: { modelName: 'VoucherGroupAddressRequest' },
          policy: async (req) => this.roleManager.can(req.token.roles, 'update', 'all', 'VoucherGroup', ['*']),
          handler: this.updateVoucherGroupAddress.bind(this),
        },
      },
      '/:id(\\d+)/pdf': {
        GET: {
          policy: async (req) => this.roleManager.can(req.token.roles, 'get', 'all', 'VoucherGroup', ['*']),
          handler: this.getVoucherGroupPdf.bind(this),
        },
      },
    };
  }

  /**
   * GET /vouchergroups
   * @summary Returns all existing voucher groups
   * @operationId getAllVouchergroups
   * @tags vouchergroups - Operations of voucher group controller
   * @security JWT
   * @param {integer} take.query - How many voucher groups the endpoint should return
   * @param {integer} skip.query - How many voucher groups should be skipped (for pagination)
   * @return {PaginatedVoucherGroupResponse} 200 - All existingvoucher
   * groups without users
   * @return {string} 500 - Internal server error
   */
  public async getAllVoucherGroups(req: RequestWithToken, res: Response): Promise<void> {
    const { body } = req;
    this.logger.trace('Get all voucher groups', body, 'by user', req.token.user);

    let take;
    let skip;
    try {
      const pagination = parseRequestPagination(req);
      take = pagination.take;
      skip = pagination.skip;
    } catch (e) {
      res.status(400).send(e.message);
      return;
    }

    // handle request
    try {
      const [bkgs, count] = await VoucherGroupService.getVoucherGroups({}, { take, skip });
      const records = bkgs.map((bkg) => VoucherGroupService.asVoucherGroupResponse(bkg, bkg.vouchers.map((v) => v.user)));
      res.json(toResponse(records, count, { take, skip }));
    } catch (error) {
      this.logger.error('Could not return all voucher groups:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * POST /vouchergroups
   * @summary Creates a new voucher group
   * @operationId createVouchergroup
   * @tags vouchergroups - Operations of voucher group controller
   * @param {VoucherGroupRequest} request.body.required -
   * The voucher group which should be created
   * @security JWT
   * @return {VoucherGroupResponse} 200 - The created voucher group entity
   * @return {string} 400 - Validation error
   * @return {string} 500 - Internal server error
   */
  public async createVoucherGroup(req: RequestWithToken, res: Response): Promise<void> {
    const body = req.body as VoucherGroupRequest;
    this.logger.trace('Create voucher group', body, 'by user', req.token.user);

    const voucherGroupParams = VoucherGroupService.asVoucherGroupParams(body);

    // handle request
    try {
      if (!VoucherGroupService.validateVoucherGroup(voucherGroupParams)) {
        res.status(400).json('Invalid voucher group.');
        return;
      }
      const { voucherGroup, users } = await VoucherGroupService.createVoucherGroup(voucherGroupParams);
      res.json(VoucherGroupService.asVoucherGroupResponse(voucherGroup, users));
    } catch (error) {
      this.logger.error('Could not create voucher group:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * GET /vouchergroups/{id}
   * @summary Returns the requested voucher group
   * @operationId getVouchergroupId
   * @tags vouchergroups - Operations of voucher group controller
   * @param {integer} id.path.required - The id of the voucher group which should be returned
   * @security JWT
   * @return {VoucherGroupResponse} 200 - The requested voucher group entity
   * @return {string} 404 - Not found error
   * @return {string} 500 - Internal server error
   */
  public async getVoucherGroupById(req: RequestWithToken, res: Response): Promise<void> {
    const { id } = req.params;
    const bkgId = Number.parseInt(id, 10);
    this.logger.trace('Get single voucher group', id, 'by user', req.token.user);

    // handle request
    try {
      const [bkgs] = await VoucherGroupService.getVoucherGroups({ bkgId });
      if (bkgs[0]) {
        const bkg = bkgs[0];
        res.json(VoucherGroupService.asVoucherGroupResponse(bkg, bkg.vouchers.map((v) => v.user)));
      } else {
        res.status(404).json('Voucher group not found.');
      }
    } catch (error) {
      this.logger.error('Could not get voucher group:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * PATCH /vouchergroups/{id}
   * @summary Updates the requested voucher group
   * @operationId updateVoucherGroup
   * @tags vouchergroups - Operations of voucher group controller
   * @param {integer} id.path.required - The id of the voucher group which should be updated
   * @param {VoucherGroupRequest} request.body.required -
   * The updated voucher group
   * @security JWT
   * @return {VoucherGroupResponse} 200 - The requested voucher group entity
   * @return {string} 400 - Validation error
   * @return {string} 404 - Not found error
   * @return {string} 500 - Internal server error
   */
  public async updateVoucherGroup(req: RequestWithToken, res: Response): Promise<void> {
    const body = req.body as VoucherGroupRequest;
    const { id } = req.params;
    const bkgId = Number.parseInt(id, 10);
    this.logger.trace('Update voucher group', id, 'with', body, 'by user', req.token.user);

    const voucherGroupParams = VoucherGroupService.asVoucherGroupParams(body);

    // handle request
    try {
      if (!VoucherGroupService.validateVoucherGroup(voucherGroupParams)) {
        res.status(400).json('Invalid voucher group.');
        return;
      }
      const bkg = await VoucherGroup.findOne({ where: { id: bkgId } });
      if (!bkg) {
        res.status(404).json('Voucher group not found.');
        return;
      }
      if (bkg.activeStartDate <= new Date()) {
        res.status(403).json('Voucher StartDate has already passed.');
        return;
      }
      if (voucherGroupParams.amount < bkg.amount) {
        res.status(400).json('Cannot decrease number of VoucherGroupUsers');
        return;
      }
      const result = await VoucherGroupService.updateVoucherGroup(bkgId, voucherGroupParams);
      res.status(200).json(
        VoucherGroupService.asVoucherGroupResponse(result.voucherGroup, result.users),
      );
    } catch (error) {
      this.logger.error('Could not update voucher group:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * PATCH /vouchergroups/{id}/address
   * @summary Updates the purchaser address and invoice date of the requested voucher group.
   * Unlike PATCH /vouchergroups/{id}, this is allowed after the group has become active.
   * @operationId updateVoucherGroupAddress
   * @tags vouchergroups - Operations of voucher group controller
   * @param {integer} id.path.required - The id of the voucher group which should be updated
   * @param {VoucherGroupAddressRequest} request.body.required - The new address and invoice date
   * @security JWT
   * @return {VoucherGroupResponse} 200 - The updated voucher group entity
   * @return {string} 400 - Validation error
   * @return {string} 404 - Not found error
   * @return {string} 500 - Internal server error
   */
  public async updateVoucherGroupAddress(req: RequestWithToken, res: Response): Promise<void> {
    const body = req.body as VoucherGroupAddressRequest;
    const { id } = req.params;
    const bkgId = Number.parseInt(id, 10);
    this.logger.trace('Update voucher group address', id, 'with', body, 'by user', req.token.user);

    try {
      if (!VoucherGroupService.hasCompleteAddress(body)) {
        res.status(400).json('Invalid address.');
        return;
      }
      const invoiceDate = VoucherGroupService.asInvoiceDate(body.invoiceDate);
      if (!VoucherGroupService.isValidInvoiceDate(invoiceDate)) {
        res.status(400).json('Invalid invoice date.');
        return;
      }
      const result = await VoucherGroupService.updateVoucherGroupAddress(bkgId, body, invoiceDate);
      if (!result) {
        res.status(404).json('Voucher group not found.');
        return;
      }
      res.status(200).json(
        VoucherGroupService.asVoucherGroupResponse(result.voucherGroup, result.users),
      );
    } catch (error) {
      this.logger.error('Could not update voucher group address:', error);
      res.status(500).json('Internal server error.');
    }
  }

  /**
   * GET /vouchergroups/{id}/pdf
   * @summary Get the statement pdf of a voucher group. Requires the group to have a complete address.
   * @operationId getVoucherGroupPdf
   * @tags vouchergroups - Operations of voucher group controller
   * @security JWT
   * @param {integer} id.path.required - The id of the voucher group
   * @param {boolean} force.query - Force creation of pdf
   * @return {PdfUrlResponse} 200 - The pdf location information.
   * @return {string} 400 - Voucher group has no address
   * @return {string} 404 - Voucher group not found
   * @return {string} 500 - Internal server error
   * @return {string} 502 - PDF generator service failed
   */
  public async getVoucherGroupPdf(req: RequestWithToken, res: Response): Promise<void> {
    const { id } = req.params;
    const bkgId = Number.parseInt(id, 10);
    this.logger.trace('Get voucher group PDF', id, 'by user', req.token.user);

    try {
      const voucherGroup = await VoucherGroup.findOne({
        where: { id: bkgId },
        relations: { pdf: true, vouchers: { user: true } },
      });
      if (!voucherGroup) {
        res.status(404).json('Voucher group not found.');
        return;
      }

      const pdf = await voucherGroup.getOrCreatePdf(req.query.force === 'true');

      res.status(200).json({ pdf: pdf.downloadName } as PdfUrlResponse);
    } catch (error) {
      if (error instanceof MissingAddressError) {
        res.status(400).json('Voucher group has no address.');
        return;
      }
      this.logger.error('Could not get voucher group PDF:', error);
      if (error instanceof PdfError) {
        res.status(502).json('PDF Generator service failed.');
        return;
      }
      res.status(500).json('Internal server error.');
    }
  }
}
