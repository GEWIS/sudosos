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

import fs from 'fs';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { DataSource, IsNull } from 'typeorm';
import express, { Application } from 'express';
import { SwaggerSpecification } from 'swagger-model-validator';
import { json } from 'body-parser';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';

import Database, { AppDataSource } from '../../../src/database/database';
import Swagger from '../../../src/start/swagger';
import InvoicePdfService from '../../../src/service/pdf/invoice-pdf-service';
import { PdfCompiler } from '../../../src/service/pdf/pdf-service';
import Invoice from '../../../src/entity/invoices/invoice';
import InvoicePdf from '../../../src/entity/file/invoice-pdf';
import User from '../../../src/entity/user/user';
import FileService from '../../../src/service/file-service';
import { truncateAllTables } from '../../helpers/database-helpers';
import { finishTestDB } from '../../helpers/test-helpers';
import { hashJSON } from '../../../src/helpers/hash';
import { InvoiceSeeder, TransactionSeeder, UserSeeder } from '../../seed';
import InvoiceService from '../../../src/service/invoice-service';
import { createInvoiceWithTransfers } from '../../helpers/invoice-helpers';
import { inUserContext, UserFactory } from '../../helpers/user-factory';
import { InvoiceState } from '../../../src/entity/invoices/invoice-status';
import { BAC } from '../../../src/files/templates/bac-letterhead';

chai.use(deepEqualInAnyOrder);

describe('InvoicePdfService', async (): Promise<void> => {
  let ctx: {
    connection: DataSource;
    app: Application;
    specification: SwaggerSpecification;
    users: User[];
    invoices: Invoice[];
    pdfParams: any;
    fileService: FileService;
  };

  // Built after Database.initialize, which replaces AppDataSource and so its manager.
  let pdfService: InvoicePdfService;

  beforeAll(async function test(): Promise<void> {
    const connection = await Database.initialize();
    await truncateAllTables(connection);
    pdfService = new InvoicePdfService();

    const users = await new UserSeeder().seed();
    const { transactions } = await new TransactionSeeder().seed(users);
    const { invoices } = await new InvoiceSeeder().seed(users, transactions);

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

    ctx = {
      connection,
      app,
      specification,
      users,
      invoices,
      pdfParams,
      fileService,
    };
  });

  afterAll(async () => {
    await finishTestDB(ctx.connection);
  });

  let compileStub: SinonStub;
  let uploadPdfStub: SinonStub;


  beforeEach(function () {
    compileStub = sinon.stub(PdfCompiler, 'compile').resolves(Buffer.from('PDF content'));
    uploadPdfStub = sinon.stub(FileService.prototype, 'uploadPdf');
  });

  afterEach(function () {
    compileStub.restore();
    uploadPdfStub.restore();
  });

  describe('getOrCreate', () => {
    it('should return the stored PDF even if the invoice changed', async () => {
      const invoice = ctx.invoices.find((i) => InvoiceService.isState(i, InvoiceState.PAID));
      const pdf = Object.assign(new InvoicePdf(), ctx.pdfParams);
      invoice.pdf = pdf;

      expect(await pdfService.getOrCreate(invoice)).to.eq(pdf);
      expect(compileStub).to.not.have.been.called;
      expect(uploadPdfStub).to.not.have.been.called;
    });
    it('should regenerate the stored PDF if it was marked stale', async () => {
      const invoice = ctx.invoices.find((i) => InvoiceService.isState(i, InvoiceState.CREATED));
      invoice.pdf = Object.assign(new InvoicePdf(), ctx.pdfParams, { hash: '' });

      await pdfService.getOrCreate(invoice);

      expect(compileStub).to.have.been.calledOnce;
      expect(uploadPdfStub).to.have.been.calledOnce;
    });
    it('should regenerate the stored PDF if force is true', async () => {
      const invoice = ctx.invoices[0];
      invoice.pdf = Object.assign(new InvoicePdf(), ctx.pdfParams);

      await pdfService.getOrCreate(invoice, true);

      expect(compileStub).to.have.been.calledOnce;
      expect(uploadPdfStub).to.have.been.calledOnce;
    });
  });

  describe('getParameters', () => {
    it('should return all required parameters for generating an invoice PDF', async () => {
      const invoice = ctx.invoices[0];
      const params = await pdfService.getParameters(invoice);

      expect(params.reference).to.eq(invoice.reference);
      expect(params.identifier).to.eq(String(invoice.id));
      expect(params.customerNumber).to.eq(String(invoice.toId));
      expect(params.subject).to.eq(invoice.description);
      expect(params.date).to.eq(invoice.date.toLocaleDateString('nl-NL'));
      expect(params.addressee).to.eq(invoice.addressee);
      expect(params.address.street).to.eq(invoice.street);
      expect(params.address.postalCode).to.eq(invoice.postalCode);
      expect(params.address.city).to.eq(invoice.city);
      expect(params.address.country).to.eq(invoice.country);

      const expectedDue = new Date(invoice.date);
      expectedDue.setDate(expectedDue.getDate() + BAC.paymentTermDays);
      expect(params.dueDate).to.eq(expectedDue.toLocaleDateString('nl-NL'));
    });

    it('should aggregate totals correctly across all sub-transaction rows', async () => {
      const invoice = ctx.invoices[0];
      const params = await pdfService.getParameters(invoice);

      let expectedExclCents = 0;
      let expectedVatCents = 0;
      invoice.subTransactionRows.forEach((row) => {
        const inclCents = row.product.priceInclVat.getAmount();
        const exclPerUnit = Math.round(inclCents / (1 + row.product.vat.percentage / 100));
        expectedExclCents += exclPerUnit * row.amount;
        expectedVatCents += (inclCents - exclPerUnit) * row.amount;
      });

      expect(params.subtotalExcl).to.be.closeTo(expectedExclCents / 100, 0.001);
      expect(params.totalVat).to.be.closeTo(expectedVatCents / 100, 0.001);
      expect(params.totalIncl).to.be.closeTo((expectedExclCents + expectedVatCents) / 100, 0.001);
      expect(params.lineItems).to.have.length(invoice.subTransactionRows.length);
    });

    it('should sort line items by sub_transaction_row id ascending', async () => {
      const invoice = ctx.invoices[0];
      const params = await pdfService.getParameters(invoice);

      const ids = params.lineItems.map((it) => it.id);
      const sorted = [...ids].sort((a, b) => a - b);
      expect(ids).to.deep.equal(sorted);
    });
  });

  describe('getOrCreate without a stored PDF', () => {
    it('should generate and upload a new PDF with the parameter hash', async () => {
      const options = InvoiceService.getOptions({ returnInvoiceEntries: true });
      const invoice = await Invoice.findOne({ ...options, where: { pdf: IsNull() } });

      uploadPdfStub.restore();
      const invoicePdf = await pdfService.getOrCreate(invoice);

      try {
        expect(invoicePdf).to.not.be.undefined;
        expect(invoicePdf.hash).to.eq(hashJSON(await pdfService.getParameters(invoice)));
        expect((await Invoice.findOne({ where: { id: invoice.id } })).pdfId).to.eq(invoicePdf.id);
      } finally {
        fs.rmSync(invoicePdf.location, { force: true });
      }
    });
    it('should throw an error if PDF generation fails', async () => {
      compileStub.rejects(new Error('Failed to generate PDF'));
      const options = InvoiceService.getOptions({ returnInvoiceEntries: true });
      const invoice = await Invoice.findOne({ ...options, where: { pdf: IsNull() } });
      await expect(pdfService.getOrCreate(invoice)).to.be.rejectedWith();
    });
  });

  describe('getOrCreate with force and a stored PDF', () => {
    it('should replace the stored file and update the hash', async () => {
      uploadPdfStub.restore();
      const options = InvoiceService.getOptions({ returnInvoiceEntries: true });
      const invoice = await Invoice.findOne({ ...options, where: { pdf: IsNull() } });

      compileStub.resolves(Buffer.from('first'));
      const first = await pdfService.getOrCreate(invoice);
      const firstLocation = first.location;

      invoice.reference = 'Changed reference';
      compileStub.resolves(Buffer.from('second'));
      const second = await pdfService.getOrCreate(invoice, true);

      try {
        expect(second.id).to.eq(first.id);
        expect(second.location).to.not.eq(firstLocation);
        expect(fs.existsSync(firstLocation)).to.be.false;
        expect(fs.readFileSync(second.location).toString()).to.eq('second');

        const expectedHash = hashJSON(await pdfService.getParameters(invoice));
        expect(second.hash).to.eq(expectedHash);
        expect((await InvoicePdf.findOne({ where: { id: second.id } })).hash).to.eq(expectedHash);
      } finally {
        fs.rmSync(second.location, { force: true });
      }
    });
  });

  describe('getOrCreate with a failing save', () => {
    it('should keep the stored PDF and its file', async () => {
      uploadPdfStub.restore();
      const options = InvoiceService.getOptions({ returnInvoiceEntries: true });
      const invoice = await Invoice.findOne({ ...options, where: { pdf: IsNull() } });

      compileStub.resolves(Buffer.from('first'));
      const first = await pdfService.getOrCreate(invoice);
      const firstLocation = first.location;

      const saveStub = sinon.stub(AppDataSource.manager, 'transaction').rejects(new Error('save failed'));
      compileStub.resolves(Buffer.from('second'));
      try {
        await expect(pdfService.getOrCreate(invoice, true)).to.be.rejectedWith('save failed');
        expect(invoice.pdf.location).to.eq(firstLocation);
        expect(fs.readFileSync(firstLocation).toString()).to.eq('first');
        expect((await InvoicePdf.findOne({ where: { id: first.id } })).location).to.eq(firstLocation);
      } finally {
        saveStub.restore();
        fs.rmSync(firstLocation, { force: true });
      }
    });
  });

  describe('PDF of deleted invoice', () => {
    it('should produce the same parameters and hash before and after deletion', async () => {
      await inUserContext((await UserFactory()).clone(2), async (debtor: User, creditor: User) => {
        const invoice = await createInvoiceWithTransfers(debtor.id, creditor.id, 1);
        const params = await pdfService.getParameters(invoice);

        const updatedInvoice = await AppDataSource.manager.transaction(async (manager) => {
          return new InvoiceService(manager).updateInvoice({
            byId: invoice.to.id,
            invoiceId: invoice.id,
            state: InvoiceState.DELETED,
          });
        });

        const newParams = await pdfService.getParameters(updatedInvoice);
        expect(hashJSON(newParams)).to.equal(hashJSON(params));
        expect(newParams).to.deep.equal(params);
      });
    });
  });

  describe('HTML content', () => {
    it('should embed key anchor strings for the F6c template', async () => {
      compileStub.restore();

      const invoice = ctx.invoices[0];
      const html = (await pdfService.html(invoice)).toString('utf-8');

      expect(html).to.contain('Total including VAT');
      expect(html).to.contain(BAC.iban);
      expect(html).to.contain(invoice.addressee);
    });

    it('should render an Attn. line when attention is set', async () => {
      compileStub.restore();

      const invoice = Object.assign(ctx.invoices[0], { attention: 'Jan Janssen' });
      const html = (await pdfService.html(invoice)).toString('utf-8');

      expect(html).to.contain('Attn. Jan Janssen');
    });

    it('should omit the Attn. line when attention is empty', async () => {
      compileStub.restore();

      const invoice = Object.assign(ctx.invoices[0], { attention: '' });
      const html = (await pdfService.html(invoice)).toString('utf-8');

      expect(html).to.not.contain('Attn.');
    });
  });
});
