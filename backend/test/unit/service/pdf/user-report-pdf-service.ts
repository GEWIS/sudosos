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
import dinero from 'dinero.js';
import { EntityManager } from 'typeorm';
import UserReportPdfService from '../../../../src/service/pdf/user-report-pdf-service';
import { BuyerReport, SalesReport } from '../../../../src/entity/report/report';
import { UserReportType } from '../../../../src/helpers/pdf';

describe('UserReportPdfService', () => {
  const fromDate = new Date('2022-01-01');
  const tillDate = new Date('2022-12-31');
  const user = { id: 7, firstName: 'Bar', lastName: 'Committee' };
  const manager = { findOne: async () => user } as unknown as EntityManager;

  const beer = {
    count: 2,
    product: { name: 'Beer', vat: { percentage: 21 } },
    totalExclVat: dinero({ amount: 200 }),
    totalInclVat: dinero({ amount: 242 }),
  };
  const vatHigh = {
    vat: { percentage: 21 },
    totalExclVat: dinero({ amount: 200 }),
    totalInclVat: dinero({ amount: 242 }),
  };

  const reportData = () => ({
    forId: user.id,
    fromDate,
    tillDate,
    data: { products: [beer], vat: [vatHigh] },
    totalExclVat: dinero({ amount: 200 }),
    totalInclVat: dinero({ amount: 242 }),
    transactionCount: 1,
  } as any);

  it('maps a sales report including its description', async () => {
    const report = new SalesReport(reportData());
    report.description = 'Borrel';

    const service = new UserReportPdfService<SalesReport>(UserReportType.Sales, manager);
    const params = await service.getParameters(report);

    expect(params.kind).to.equal(UserReportType.Sales);
    expect(params.account).to.equal('Bar Committee');
    expect(params.customerNumber).to.equal('7');
    expect(params.description).to.equal('Borrel');
    expect(params.startDate).to.equal(fromDate.toLocaleDateString('nl-NL'));
    expect(params.endDate).to.equal(tillDate.toLocaleDateString('nl-NL'));
    expect(params.lineItems.map((it) => it.description)).to.deep.equal(['Beer']);
    expect(params.vatBreakdown.map((b) => b.rate)).to.deep.equal([21]);
    expect(params.totalIncl).to.be.closeTo(2.42, 0.001);
    expect(params.subtotalExcl).to.be.closeTo(2, 0.001);
    expect(params.totalVat).to.be.closeTo(0.42, 0.001);

    const html = (await service.createRaw(report)).toString('utf-8');
    expect(html).to.include('Sales Report');
    expect(html).to.include('Borrel');
  });

  it('maps a purchase report without a description', async () => {
    const report = new BuyerReport(reportData());

    const service = new UserReportPdfService<BuyerReport>(UserReportType.Purchases, manager);
    const params = await service.getParameters(report);

    expect(params.kind).to.equal(UserReportType.Purchases);
    expect(params.description).to.equal('');

    const html = (await service.createRaw(report)).toString('utf-8');
    expect(html).to.include('Purchase Report');
  });

  it('throws when the report has no products', async () => {
    const report = new BuyerReport({ ...reportData(), data: {} });
    const service = new UserReportPdfService<BuyerReport>(UserReportType.Purchases, manager);
    await expect(service.getParameters(report)).to.eventually.be.rejectedWith(Error, 'No products found in report');
  });

  it('throws when the user does not exist', async () => {
    const report = new BuyerReport(reportData());
    const noUserManager = { findOne: async (): Promise<null> => null } as unknown as EntityManager;
    const service = new UserReportPdfService<BuyerReport>(UserReportType.Purchases, noUserManager);
    await expect(service.getParameters(report)).to.eventually.be.rejectedWith(Error, 'User not found');
  });
});
