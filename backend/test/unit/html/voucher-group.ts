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
import {
  createVoucherGroupPdf,
  IVoucherGroupPdf,
} from '../../../src/html/voucher-group.html';

describe('createVoucherGroupPdf', () => {
  const params: IVoucherGroupPdf = {
    reference: 'SDS-VG-0001',
    identifier: '1',
    date: '1-9-2026',
    name: 'Freshers weekend',
    addressee: 'Study association GEWIS',
    attention: 'Treasurer',
    address: {
      street: 'Groene Loper 5',
      postalCode: '5612 AE',
      city: 'Eindhoven',
      country: 'Netherlands',
    },
    startDate: '2-9-2026',
    endDate: '4-9-2026',
    amount: 40,
    balancePerCard: 7.5,
    vatBreakdown: [{ rate: 0, excl: 300, vat: 0, incl: 300 }],
    lineItems: Array.from({ length: 40 }, (_, i) => ({
      description: `Voucher card Freshers weekend_${i} (#${100 + i})`, qty: 1, rate: 0, excl: 7.5, vat: 0, incl: 7.5,
    })),
    totalIncl: 300,
    subtotalExcl: 300,
    totalVat: 0,
  };

  it('renders the statement header, reference and group name', () => {
    const html = createVoucherGroupPdf(params);
    expect(html).to.include('Voucher Statement');
    expect(html).to.include(params.reference);
    expect(html).to.include(params.name);
  });

  it('renders the full recipient address block', () => {
    const html = createVoucherGroupPdf(params);
    expect(html).to.include(params.addressee);
    expect(html).to.include('Attn. Treasurer');
    expect(html).to.include(params.address.street);
    expect(html).to.include(`${params.address.postalCode} ${params.address.city}`);
    expect(html).to.include(params.address.country);
  });

  it('omits the attention line when it is empty', () => {
    const html = createVoucherGroupPdf({ ...params, attention: '  ' });
    expect(html).to.not.include('Attn.');
  });

  it('renders the validity period, card count and totals (nl-NL formatted)', () => {
    const html = createVoucherGroupPdf(params);
    expect(html).to.include(params.startDate);
    expect(html).to.include(params.endDate);
    expect(html).to.include('>40<');
    expect(html).to.include('7,50');
    expect(html).to.include('300,00');
    expect(html).to.include('Total allocated balance');
  });

  it('renders a line item per voucher card', () => {
    const html = createVoucherGroupPdf(params);
    expect(html).to.include('Voucher card Freshers weekend_0 (#100)');
    expect(html).to.include('Voucher card Freshers weekend_39 (#139)');
  });

  it('labels the reference as the voucher number', () => {
    const html = createVoucherGroupPdf(params);
    expect(html).to.include('Voucher number');
    expect(html).to.not.include('Statement number');
  });

  it('explains that voucher balance is a Multi Purpose Voucher without VAT', () => {
    const html = createVoucherGroupPdf(params);
    expect(html).to.include('Multi Purpose Vouchers (MPV)');
    expect(html).to.include('Directive (EU) 2016/1065');
    expect(html).to.include('No VAT is due on the issue of these vouchers');
  });

  it('uses the singular form for a single card', () => {
    const html = createVoucherGroupPdf({ ...params, amount: 1 });
    expect(html).to.include('voucher card with');
    expect(html).to.not.include('voucher cards');
  });

  it('escapes HTML in user-provided fields', () => {
    const html = createVoucherGroupPdf({
      ...params,
      name: '<script>alert(1)</script>',
      addressee: 'Bar & Co <b>',
    });
    expect(html).to.not.include('<script>alert(1)</script>');
    expect(html).to.include('&lt;script&gt;');
    expect(html).to.include('Bar &amp; Co &lt;b&gt;');
  });
});
