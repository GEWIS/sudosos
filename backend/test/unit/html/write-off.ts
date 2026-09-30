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
import { BAC } from '../../../src/files/templates/bac-letterhead';
import { createWriteOffPdf, IWriteOffPdf } from '../../../src/html/write-off.html';

describe('createWriteOffPdf', () => {
  const params: IWriteOffPdf = {
    reference: 'SDS-WR-0001',
    account: 'Bar Committee',
    accountId: '7',
    date: '1-1-2026',
    amount: '€12,50',
  };

  it('renders the header, reference and account', () => {
    const html = createWriteOffPdf(params);
    expect(html).to.include('Write-off number');
    expect(html).to.include(params.reference);
    expect(html).to.include(params.account);
    expect(html).to.include(`Account: ${params.accountId}`);
  });

  it('renders the amount', () => {
    const html = createWriteOffPdf(params);
    expect(html).to.include(params.amount);
  });

  it('renders the BAC letterhead footer', () => {
    const html = createWriteOffPdf(params);
    expect(html).to.include(BAC.email);
    expect(html).to.include(BAC.iban);
    expect(html).to.include(BAC.kvk);
    expect(html).to.not.include('Service:');
  });

  it('escapes user-supplied values', () => {
    const html = createWriteOffPdf({ ...params, account: '<script>alert(1)</script>' });
    expect(html).to.not.include('<script>alert(1)</script>');
    expect(html).to.include('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
