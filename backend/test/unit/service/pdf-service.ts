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

import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { PdfCompiler, PdfService, StoredPdfService } from '../../../src/service/pdf/pdf-service';
import Pdf from '../../../src/entity/file/pdf-file';
import User from '../../../src/entity/user/user';
import FileService from '../../../src/service/file-service';
import { PdfError } from '../../../src/errors';
import { ReturnFileType } from '../../../src/helpers/pdf';
import { hashJSON } from '../../../src/helpers/hash';

class TestEntity {
  id = 1;

  pdf?: Pdf;
}

type TestParams = { id: number };

class TestPdfService extends PdfService<TestEntity, TestParams> {
  async getParameters(entity: TestEntity): Promise<TestParams> {
    return { id: entity.id };
  }

  render(params: TestParams): string {
    return `<html>${params.id}</html>`;
  }
}

const owner = Object.assign(new User(), { id: 1 });

class TestStoredPdfService extends StoredPdfService<TestEntity, Pdf, TestParams> {
  readonly location = './test-location';

  readonly pdfConstructor = Pdf;

  getOwner(): User {
    return owner;
  }

  async getParameters(entity: TestEntity): Promise<TestParams> {
    return { id: entity.id };
  }

  render(params: TestParams): string {
    return `<html>${params.id}</html>`;
  }
}

describe('PdfService', () => {
  let compileStub: SinonStub;

  beforeEach(() => {
    compileStub = sinon.stub(PdfCompiler, 'compile').resolves(Buffer.from('PDF content'));
  });

  afterEach(() => {
    sinon.restore();
  });

  it('html should return the rendered HTML', async () => {
    const result = await new TestPdfService().html(new TestEntity());

    expect(result.toString('utf-8')).to.equal('<html>1</html>');
    expect(compileStub).to.not.have.been.called;
  });

  it('pdf should compile the rendered HTML', async () => {
    const result = await new TestPdfService().pdf(new TestEntity());

    expect(result).to.deep.equal(Buffer.from('PDF content'));
    expect(compileStub).to.have.been.calledOnceWith('<html>1</html>');
  });

  it('output should return the PDF or HTML depending on the file type', async () => {
    const service = new TestPdfService();

    expect(await service.output(new TestEntity(), ReturnFileType.PDF)).to.deep.equal(Buffer.from('PDF content'));
    expect((await service.output(new TestEntity(), ReturnFileType.HTML)).toString('utf-8')).to.equal('<html>1</html>');
  });
});

describe('StoredPdfService', () => {
  let compileStub: SinonStub;
  let uploadStub: SinonStub;

  beforeEach(() => {
    compileStub = sinon.stub(PdfCompiler, 'compile').resolves(Buffer.from('PDF content'));
    uploadStub = sinon.stub(FileService.prototype, 'uploadPdf').resolves(new Pdf());
  });

  afterEach(() => {
    sinon.restore();
  });

  it('getOrCreate should return the stored PDF without rendering', async () => {
    const entity = Object.assign(new TestEntity(), { pdf: Object.assign(new Pdf(), { hash: 'hash' }) });

    expect(await new TestStoredPdfService().getOrCreate(entity)).to.equal(entity.pdf);
    expect(compileStub).to.not.have.been.called;
    expect(uploadStub).to.not.have.been.called;
  });

  it('getOrCreate should upload a new PDF if forced', async () => {
    const entity = Object.assign(new TestEntity(), { pdf: new Pdf() });

    await new TestStoredPdfService().getOrCreate(entity, true);

    expect(uploadStub).to.have.been.calledOnce;
  });

  it('getOrCreate should not re-render a stored PDF if its data changed', async () => {
    const pdf = Object.assign(new Pdf(), { hash: 'outdated' });
    const entity = Object.assign(new TestEntity(), { pdf });

    expect(await new TestStoredPdfService().getOrCreate(entity)).to.equal(pdf);
    expect(compileStub).to.not.have.been.called;
  });

  it('getOrCreate should re-render a stored PDF whose hash was cleared', async () => {
    const pdf = Object.assign(new Pdf(), { hash: '' });
    const entity = Object.assign(new TestEntity(), { pdf });

    await new TestStoredPdfService().getOrCreate(entity);

    expect(uploadStub).to.have.been.calledOnceWith(entity, Pdf, Buffer.from('PDF content'), owner, hashJSON({ id: 1 }));
  });

  it('getOrCreate should upload a new PDF with the parameter hash if none is stored', async () => {
    const entity = new TestEntity();

    await new TestStoredPdfService().getOrCreate(entity);

    expect(uploadStub).to.have.been.calledOnceWith(entity, Pdf, Buffer.from('PDF content'), owner, hashJSON({ id: 1 }));
  });
});

describe('PdfCompiler', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return the compiled PDF', async () => {
    sinon.stub(globalThis, 'fetch').resolves(new Response('PDF content', { status: 200 }));

    expect(await PdfCompiler.compile('<html></html>')).to.deep.equal(Buffer.from('PDF content'));
  });

  it('should send the HTML to the configured pdf-compiler URL on every compile', async () => {
    const fetchStub = sinon.stub(globalThis, 'fetch').callsFake(async () => new Response('PDF content', { status: 200 }));
    const originalUrl = process.env.HTML_PDF_GEN_URL;

    try {
      process.env.HTML_PDF_GEN_URL = 'http://first:8080/api/v1';
      await PdfCompiler.compile('<html></html>');
      process.env.HTML_PDF_GEN_URL = 'http://second:8080/api/v1';
      await PdfCompiler.compile('<html></html>');
    } finally {
      if (originalUrl === undefined) delete process.env.HTML_PDF_GEN_URL;
      else process.env.HTML_PDF_GEN_URL = originalUrl;
    }

    const urls = fetchStub.getCalls().map((call) => (call.args[0] as Request).url);
    expect(urls[0]).to.match(/^http:\/\/first:8080\/api\/v1\//);
    expect(urls[1]).to.match(/^http:\/\/second:8080\/api\/v1\//);
  });

  it('should throw a PdfError if pdf-compiler returns an error status', async () => {
    sinon.stub(globalThis, 'fetch').resolves(new Response('Internal Server Error', { status: 500 }));

    await expect(PdfCompiler.compile('<html></html>')).to.be.rejectedWith(PdfError, 'HTML PDF generation failed: 500');
  });

  it('should throw a PdfError if pdf-compiler is unreachable', async () => {
    sinon.stub(globalThis, 'fetch').rejects(new Error('Network error'));

    await expect(PdfCompiler.compile('<html></html>')).to.be.rejectedWith(PdfError, 'HTML PDF generation failed: Network error');
  });
});
