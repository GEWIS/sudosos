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
import { createTransferPdf, ITransferPdf } from '../../../src/html/transfer.html';

describe('createTransferPdf', () => {
  const params: ITransferPdf = {
    transferId: '42',
    fromUserFirstName: 'Alice',
    fromUserLastName: 'Anders',
    fromAccount: '1',
    toUserFirstName: 'Bob',
    toUserLastName: 'Bakker',
    toAccount: '2',
    date: '1-1-2026',
    description: 'Borrel refund',
    amount: '€5,00',
    serviceEmail: 'treasurer@example.com',
  };

  it('renders the transfer id, both accounts, description and amount', () => {
    const html = createTransferPdf(params);
    expect(html).to.include('Transfer ID');
    expect(html).to.include(params.transferId);
    expect(html).to.include('Alice Anders');
    expect(html).to.include('Bob Bakker');
    expect(html).to.include(params.description);
    expect(html).to.include(params.amount);
  });

  it('escapes the user-supplied description', () => {
    const html = createTransferPdf({ ...params, description: '<b>x</b>' });
    expect(html).to.not.include('<b>x</b>');
    expect(html).to.include('&lt;b&gt;x&lt;/b&gt;');
  });

  it('escapes user names', () => {
    const html = createTransferPdf({ ...params, fromUserFirstName: '<i>Eve</i>' });
    expect(html).to.include('&lt;i&gt;Eve&lt;/i&gt;');
  });
});
