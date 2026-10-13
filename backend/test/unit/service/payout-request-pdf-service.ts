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

import sinon, { SinonStub } from 'sinon';
import chai, { expect } from 'chai';
import { DataSource } from 'typeorm';
import express, { Application } from 'express';
import { SwaggerSpecification } from 'swagger-model-validator';
import User from '../../../src/entity/user/user';
import Database from '../../../src/database/database';
import Swagger from '../../../src/start/swagger';
import { json } from 'body-parser';
import FileService from '../../../src/service/file-service';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import { truncateAllTables } from '../../helpers/database-helpers';
import { finishTestDB } from '../../helpers/test-helpers';
import PayoutRequest from '../../../src/entity/transactions/payout/payout-request';
import PayoutRequestPdfService from '../../../src/service/pdf/payout-request-pdf-service';
import { PdfCompiler } from '../../../src/service/pdf/pdf-service';
import PayoutRequestPdf from '../../../src/entity/file/payout-request-pdf';
import { hashJSON } from '../../../src/helpers/hash';
import { PayoutRequestSeeder, UserSeeder } from '../../seed';
import { PdfError } from '../../../src/errors';

chai.use(deepEqualInAnyOrder);
describe('PayoutRequestPdfService', async () => {
  let ctx: {
    connection: DataSource,
    app: Application,
    specification: SwaggerSpecification,
    users: User[],
    payoutRequests: PayoutRequest[],
    pdfParams: any,
    fileService: FileService,
  };

  beforeAll(async function test(): Promise<void> {
    const connection = await Database.initialize();
    await truncateAllTables(connection);

    const users = await new UserSeeder().seed();
    const { payoutRequests } = await new PayoutRequestSeeder().seed(users);

    // start app
    const app = express();
    const specification = await Swagger.initialize(app);
    app.use(json());

    const pdfParams = {
      hash: 'default hash',
      downloadName: 'test name',
      location: 'location',
      createdBy: users[0],
    };

    const fileService: FileService = new FileService('./data/simple', 'disk');

    // initialize context
    ctx = {
      connection,
      app,
      specification,
      users,
      payoutRequests,
      pdfParams,
      fileService,
    };
  });

  afterAll(async () => {
    await finishTestDB(ctx.connection);
  });

  let compileStub: SinonStub;
  let uploadStub: SinonStub;

  const pdfService = new PayoutRequestPdfService();

  const getPayoutRequest = () => PayoutRequest.findOne({ where: { id: 1 }, relations: { requestedBy: true } });

  beforeEach(function () {
    compileStub = sinon.stub(PdfCompiler, 'compile').resolves(Buffer.from('PDF content'));
    uploadStub = sinon.stub(FileService.prototype, 'uploadPdf');
  });

  afterEach(function () {
    compileStub.restore();
    uploadStub.restore();
  });

  describe('getOrCreate', () => {
    it('should return the stored PDF even if the requester was renamed', async () => {
      const payoutRequest = await getPayoutRequest();
      const pdf = Object.assign(new PayoutRequestPdf(), ctx.pdfParams);
      payoutRequest.pdf = pdf;
      payoutRequest.requestedBy.firstName = 'Renamed';

      expect(await pdfService.getOrCreate(payoutRequest)).to.eq(pdf);
      expect(compileStub).to.not.have.been.called;
      expect(uploadStub).to.not.have.been.called;
    });
    it('should regenerate the stored PDF if force is true', async () => {
      const payoutRequest = await getPayoutRequest();
      payoutRequest.pdf = Object.assign(new PayoutRequestPdf(), ctx.pdfParams);

      await pdfService.getOrCreate(payoutRequest, true);

      expect(compileStub).to.have.been.calledOnce;
      expect(uploadStub).to.have.been.calledOnce;
    });
    it('should upload a new PDF with the parameter hash if none is stored', async () => {
      const payoutRequest = await getPayoutRequest();
      payoutRequest.pdf = undefined;
      const newPdf = Object.assign(new PayoutRequestPdf(), ctx.pdfParams);
      uploadStub.resolves(newPdf);

      expect(await pdfService.getOrCreate(payoutRequest)).to.eq(newPdf);
      expect(uploadStub).to.have.been.calledOnceWith(
        payoutRequest, PayoutRequestPdf, Buffer.from('PDF content'), payoutRequest.requestedBy, hashJSON(await pdfService.getParameters(payoutRequest)),
      );
    });
    it('should throw an error if PDF generation fails', async () => {
      compileStub.rejects(new PdfError('Failed to generate PDF'));
      const payoutRequest = await getPayoutRequest();
      payoutRequest.pdf = undefined;

      await expect(pdfService.getOrCreate(payoutRequest)).to.eventually.be.rejectedWith(PdfError);
      expect(uploadStub).to.not.have.been.called;
    });
  });

  describe('getParameters and html', () => {
    it('should render the payout request details into the HTML', async () => {
      const payoutRequest = await PayoutRequest.findOne({ where: { id: 1 }, relations: { requestedBy: true } });
      const params = await pdfService.getParameters(payoutRequest);

      expect(params.reference).to.eq('SDS-PR-0001');
      expect(params.accountId).to.eq(String(payoutRequest.requestedBy.id));
      expect(params.bankAccountNumber).to.eq(payoutRequest.bankAccountNumber);
      expect(params.amount).to.eq(payoutRequest.amount.toFormat());

      const html = (await pdfService.html(payoutRequest)).toString('utf-8');
      expect(html).to.include('SDS-PR-0001');
      expect(html).to.include(payoutRequest.bankAccountNumber);
      expect(compileStub).to.not.have.been.called;
    });
  });
});
