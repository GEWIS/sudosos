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
import { createUserReportPdf, IUserReportPdf } from '../../../src/html/user-report.html';
import { UserReportType } from '../../../src/helpers/pdf';

describe('createUserReportPdf', () => {
  const params: IUserReportPdf = {
    kind: UserReportType.Sales,
    account: 'Bar Committee',
    customerNumber: '7',
    startDate: '1-1-2026',
    endDate: '31-1-2026',
    description: 'October bar sales',
    vatBreakdown: [
      { rate: 9, excl: 8.26, vat: 0.74, incl: 9.00 },
      { rate: 21, excl: 33.06, vat: 6.94, incl: 40.00 },
    ],
    lineItems: [
      { description: 'Beer', qty: 40, rate: 21, excl: 33.06, vat: 6.94, incl: 40.00 },
      { description: 'Cola', qty: 10, rate: 9, excl: 8.26, vat: 0.74, incl: 9.00 },
    ],
    totalIncl: 49.00,
    subtotalExcl: 41.32,
    totalVat: 7.68,
  };

  it('renders a sales report with the account and period', () => {
    const html = createUserReportPdf(params);
    expect(html).to.include('Sales Report');
    expect(html).to.include('overview of your sales');
    expect(html).to.include(params.account);
    expect(html).to.include(params.customerNumber);
    expect(html).to.include(params.startDate);
    expect(html).to.include(params.endDate);
  });

  it('renders a purchase report', () => {
    const html = createUserReportPdf({ ...params, kind: UserReportType.Purchases });
    expect(html).to.include('Purchase Report');
    expect(html).to.include('overview of your purchases');
    expect(html).to.not.include('Sales Report');
  });

  it('renders the description as a section when set', () => {
    const html = createUserReportPdf(params);
    expect(html).to.include(params.description);
  });

  it('omits the description section when empty', () => {
    const withDescription = createUserReportPdf(params);
    const without = createUserReportPdf({ ...params, description: '' });
    // The line-items table also has a "Description" column header, so compare counts.
    const count = (html: string) => html.split('>Description<').length - 1;
    expect(count(withDescription)).to.equal(count(without) + 1);
  });

  it('renders each line item and VAT band rate', () => {
    const html = createUserReportPdf(params);
    params.lineItems.forEach((it) => expect(html).to.include(it.description));
    expect(html).to.include('9%');
    expect(html).to.include('21%');
  });

  it('escapes user-supplied values', () => {
    const html = createUserReportPdf({ ...params, account: '<script>alert(1)</script>' });
    expect(html).to.not.include('<script>alert(1)</script>');
    expect(html).to.include('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
