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

/**
 * This is the page of voucher-group-pdf-service.
 *
 * @module internal/pdf/voucher-group-pdf-service
 */

import VoucherGroup from '../../entity/user/voucher-group';
import VoucherGroupPdf from '../../entity/file/voucher-group-pdf';
import { createVoucherGroupPdf, IVoucherGroupPdf } from '../../html/voucher-group.html';
import { HtmlPdfService } from './pdf-service';
import { MissingAddressError } from '../../errors';
import VoucherGroupService from '../voucher-group-service';
import User from '../../entity/user/user';
// eslint-disable-next-line import/no-cycle
import UserVoucherGroup from '../../entity/user/user-voucher-group';

export default class VoucherGroupPdfService extends HtmlPdfService<VoucherGroupPdf, VoucherGroup, IVoucherGroupPdf> {
  pdfConstructor = VoucherGroupPdf;

  htmlGenerator = createVoucherGroupPdf;

  /**
   * The voucher cards of the group, ordered by id. Uses the loaded
   * `vouchers.user` relation when present, and queries it otherwise.
   */
  private static async getCards(group: VoucherGroup): Promise<User[]> {
    const links = group.vouchers?.every((v) => v.user)
      ? group.vouchers
      : await UserVoucherGroup.find({ where: { voucherGroup: { id: group.id } }, relations: { user: true } });
    return links.map((l) => l.user).sort((a, b) => a.id - b.id);
  }

  /**
   * Voucher balance is prepaid credit: VAT is accounted for when the cards are
   * spent, so the statement shows a single 0% band. Each voucher card is
   * listed as its own line item.
   * @throws MissingAddressError when the group has no complete address.
   */
  async getParameters(group: VoucherGroup): Promise<IVoucherGroupPdf> {
    if (!VoucherGroupService.hasCompleteAddress(group)) {
      throw new MissingAddressError(`Voucher group ${group.id} has no complete address.`);
    }

    const cards = await VoucherGroupPdfService.getCards(group);

    // Work in cents to avoid float drift.
    const perCardCents = group.balance.getAmount();
    const totalCents = perCardCents * cards.length;

    return {
      reference: `SDS-VG-${String(group.id).padStart(4, '0')}`,
      identifier: String(group.id),
      // createdAt rather than "now", so the parameter hash (and thus the cached PDF) stays stable.
      date: group.createdAt.toLocaleDateString('nl-NL'),
      name: group.name,
      addressee: group.addressee,
      attention: group.attention ?? '',
      address: {
        street: group.street,
        postalCode: group.postalCode,
        city: group.city,
        country: group.country,
      },
      startDate: group.activeStartDate.toLocaleDateString('nl-NL'),
      endDate: group.activeEndDate.toLocaleDateString('nl-NL'),
      amount: cards.length,
      balancePerCard: perCardCents / 100,
      vatBreakdown: [{
        rate: 0, excl: totalCents / 100, vat: 0, incl: totalCents / 100,
      }],
      lineItems: cards.map((card) => ({
        description: `Voucher card ${card.firstName} (#${card.id})`,
        qty: 1,
        rate: 0,
        excl: perCardCents / 100,
        vat: 0,
        incl: perCardCents / 100,
      })),
      totalIncl: totalCents / 100,
      subtotalExcl: totalCents / 100,
      totalVat: 0,
    };
  }
}
