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


import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import { defaultBefore, DefaultContext, finishTestDB } from '../../helpers/test-helpers';
import { WriteOffSeeder } from '../../seed';
import WriteOff from '../../../src/entity/transactions/write-off';
import FileService from '../../../src/service/file-service';
import { hashJSON } from '../../../src/helpers/hash';
import sinon, { SinonStub } from 'sinon';
import WriteOffPdfService from '../../../src/service/pdf/write-off-pdf-service';
import { PdfCompiler } from '../../../src/service/pdf/pdf-service';
import { PdfError } from '../../../src/errors';
import User from '../../../src/entity/user/user';
import chai, { expect } from 'chai';
import WriteOffPdf from '../../../src/entity/file/write-off-pdf';

type PdfParams = {
  hash: string;
  downloadName: string;
  location: string;
  createdBy: User;
};

chai.use(deepEqualInAnyOrder);
describe('WriteOffPdfService', () => {
  let ctx: DefaultContext & {
    writeOffs: WriteOff[];
    fileService: FileService,
    pdfParams: PdfParams,
  };
  
  beforeAll(async function t(): Promise<void> {
    const defaultContext = await defaultBefore();
    
    const writeOffs = await new WriteOffSeeder().seed();
    const fileService: FileService = new FileService('./data/simple', 'disk');
    
    const pdfParams: PdfParams = {
      hash: 'default hash',
      downloadName: 'test name',
      location: 'location',
      createdBy: writeOffs[0].to,
    };
    
    ctx = {
      ...defaultContext,
      writeOffs,
      fileService,
      pdfParams,
    };
  });
  
  afterAll(async () => {
    await finishTestDB(ctx.connection);
  });
  
  let compileStub: SinonStub;
  let uploadStub: SinonStub;

  const pdfService = new WriteOffPdfService();

  const getWriteOff = () => WriteOff.findOne({ where: { id: 1 }, relations: { to: true } });

  beforeEach(function () {
    compileStub = sinon.stub(PdfCompiler, 'compile').resolves(Buffer.from('PDF content'));
    uploadStub = sinon.stub(FileService.prototype, 'uploadPdf');
  });

  afterEach(function () {
    compileStub.restore();
    uploadStub.restore();
  });

  describe('getOrCreate', () => {
    it('should return the stored PDF even if the owner was renamed', async () => {
      const writeOff = await getWriteOff();
      const pdf = Object.assign(new WriteOffPdf(), ctx.pdfParams);
      writeOff.pdf = pdf;
      writeOff.to.firstName = 'Renamed';

      expect(await pdfService.getOrCreate(writeOff)).to.eq(pdf);
      expect(compileStub).to.not.have.been.called;
      expect(uploadStub).to.not.have.been.called;
    });
    it('should regenerate the stored PDF if force is true', async () => {
      const writeOff = await getWriteOff();
      writeOff.pdf = Object.assign(new WriteOffPdf(), ctx.pdfParams);

      await pdfService.getOrCreate(writeOff, true);

      expect(compileStub).to.have.been.calledOnce;
      expect(uploadStub).to.have.been.calledOnce;
    });
    it('should upload a new PDF with the parameter hash if none is stored', async () => {
      const writeOff = await getWriteOff();
      writeOff.pdf = undefined;
      const newPdf = Object.assign(new WriteOffPdf(), ctx.pdfParams);
      uploadStub.resolves(newPdf);

      expect(await pdfService.getOrCreate(writeOff)).to.eq(newPdf);
      expect(uploadStub).to.have.been.calledOnceWith(
        writeOff, WriteOffPdf, Buffer.from('PDF content'), writeOff.to, hashJSON(await pdfService.getParameters(writeOff)),
      );
    });
    it('should throw an error if PDF generation fails', async () => {
      compileStub.rejects(new PdfError('Failed to generate PDF'));
      const writeOff = await getWriteOff();
      writeOff.pdf = undefined;

      await expect(pdfService.getOrCreate(writeOff)).to.eventually.be.rejectedWith(PdfError);
      expect(uploadStub).to.not.have.been.called;
    });
  });

  describe('getParameters and html', () => {
    it('should render the write-off details into the HTML', async () => {
      const writeOff = await WriteOff.findOne({ where: { id: 1 }, relations: { to: true } });
      const params = await pdfService.getParameters(writeOff);

      expect(params.reference).to.eq('SDS-WR-0001');
      expect(params.accountId).to.eq(String(writeOff.to.id));
      expect(params.amount).to.eq(writeOff.amount.toFormat());

      const html = (await pdfService.html(writeOff)).toString('utf-8');
      expect(html).to.include('SDS-WR-0001');
      expect(compileStub).to.not.have.been.called;
    });
  });
});
