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
import { createPayoutRequestPdf, IPayoutRequestPdf } from '../../../src/html/payout-request.html';

describe('createPayoutRequestPdf', () => {
  const params: IPayoutRequestPdf = {
    reference: 'SDS-PR-0001',
    requestedBy: 'Bar Committee',
    accountId: '7',
    bankAccountName: 'B. Committee',
    bankAccountNumber: 'NL00BANK0123456789',
    date: '1-1-2026',
    amount: '€12,50',
    serviceEmail: 'treasurer@example.com',
  };

  it('renders the header, reference, requester and bank account', () => {
    const html = createPayoutRequestPdf(params);
    expect(html).to.include('Payout number');
    expect(html).to.include(params.reference);
    expect(html).to.include(params.requestedBy);
    expect(html).to.include(`Account: ${params.accountId}`);
    expect(html).to.include(params.bankAccountName);
    expect(html).to.include(params.bankAccountNumber);
  });

  it('renders the amount and the service email', () => {
    const html = createPayoutRequestPdf(params);
    expect(html).to.include(params.amount);
    expect(html).to.include(params.serviceEmail);
  });

  it('escapes user-supplied values', () => {
    const html = createPayoutRequestPdf({ ...params, bankAccountName: '<script>alert(1)</script>' });
    expect(html).to.not.include('<script>alert(1)</script>');
    expect(html).to.include('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
