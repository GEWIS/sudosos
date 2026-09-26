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
import VoucherGroupPdfService from '../../../../src/service/pdf/voucher-group-pdf-service';
import VoucherGroup from '../../../../src/entity/user/voucher-group';
import { VOUCHER_GROUP_PDF_LOCATION } from '../../../../src/files/storage/locations';
import { MissingAddressError } from '../../../../src/errors';

describe('VoucherGroupPdfService', () => {
  const invoiceDate = new Date('2026-09-01T12:00:00Z');
  const activeStartDate = new Date('2026-09-02T00:00:00');
  const activeEndDate = new Date('2026-09-04T23:59:59');

  const makeCards = (amount: number) => Array.from({ length: amount }, (_, i) => ({
    userId: 100 + i,
    user: { id: 100 + i, firstName: `Freshers weekend_${i}` },
  }));

  const makeGroup = (overrides: Partial<VoucherGroup> = {}) => ({
    id: 3,
    createdAt: new Date('2026-08-15T12:00:00'),
    invoiceDate,
    name: 'Freshers weekend',
    activeStartDate,
    activeEndDate,
    amount: 40,
    balance: dinero({ amount: 750 }),
    addressee: 'Study association GEWIS',
    attention: '',
    street: 'Groene Loper 5',
    postalCode: '5612 AE',
    city: 'Eindhoven',
    country: 'Netherlands',
    vouchers: makeCards(overrides.amount ?? 40),
    ...overrides,
  } as unknown as VoucherGroup);

  const service = new VoucherGroupPdfService(VOUCHER_GROUP_PDF_LOCATION);

  it('maps the voucher group into statement pdf parameters', async () => {
    const params = await service.getParameters(makeGroup());

    expect(params.reference).to.equal('SDS-VG-0003');
    expect(params.identifier).to.equal('3');
    expect(params.date).to.equal(invoiceDate.toLocaleDateString('nl-NL'));
    expect(params.dueDate).to.equal(new Date('2026-10-01T12:00:00Z').toLocaleDateString('nl-NL'));
    expect(params.startDate).to.equal(activeStartDate.toLocaleDateString('nl-NL'));
    expect(params.endDate).to.equal(activeEndDate.toLocaleDateString('nl-NL'));
    expect(params.name).to.equal('Freshers weekend');
    expect(params.addressee).to.equal('Study association GEWIS');
    expect(params.address).to.deep.equal({
      street: 'Groene Loper 5',
      postalCode: '5612 AE',
      city: 'Eindhoven',
      country: 'Netherlands',
    });
    expect(params.amount).to.equal(40);
    expect(params.balancePerCard).to.equal(7.5);
  });

  it('computes totals as cards times balance, with a single 0% VAT band', async () => {
    const params = await service.getParameters(makeGroup());

    expect(params.totalIncl).to.equal(300);
    expect(params.subtotalExcl).to.equal(300);
    expect(params.totalVat).to.equal(0);
    expect(params.vatBreakdown).to.deep.equal([{ rate: 0, excl: 300, vat: 0, incl: 300 }]);
  });

  it('lists every voucher card as its own line item, ordered by id', async () => {
    const vouchers = makeCards(3).reverse();
    const params = await service.getParameters(makeGroup({ amount: 3, vouchers } as unknown as Partial<VoucherGroup>));

    expect(params.amount).to.equal(3);
    expect(params.lineItems).to.deep.equal([0, 1, 2].map((i) => ({
      description: `Voucher card Freshers weekend_${i} (#${100 + i})`,
      qty: 1,
      rate: 0,
      excl: 7.5,
      vat: 0,
      incl: 7.5,
    })));
  });

  it('avoids float drift by computing in cents', async () => {
    const params = await service.getParameters(makeGroup({ amount: 3, balance: dinero({ amount: 10 }) }));
    expect(params.totalIncl).to.equal(0.3);
  });

  it('produces a stable parameter hash input over time', async () => {
    const a = await service.getParameters(makeGroup());
    const b = await service.getParameters(makeGroup());
    expect(a).to.deep.equal(b);
  });

  ['addressee', 'street', 'postalCode', 'city', 'country'].forEach((field) => {
    it(`throws MissingAddressError when ${field} is blank`, async () => {
      const group = makeGroup({ [field]: ' ' } as Partial<VoucherGroup>);
      await expect(service.getParameters(group)).to.be.rejectedWith(MissingAddressError);
    });
  });

  it('renders the parameters to an HTML buffer via createRaw', async () => {
    const buffer = await service.createRaw(makeGroup());
    const text = buffer.toString('utf-8');
    expect(text).to.include('Voucher Statement');
    expect(text).to.include('SDS-VG-0003');
    expect(text).to.include('Groene Loper 5');
  });
});
