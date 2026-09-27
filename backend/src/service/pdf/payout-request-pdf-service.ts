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
 * This is the page of payout-request-pdf-service.
 *
 * @module internal/pdf/payout-request-pdf-service
 */

import PayoutRequest from '../../entity/transactions/payout/payout-request';
import PayoutRequestPdf from '../../entity/file/payout-request-pdf';
import { HtmlPdfService } from './pdf-service';
import { createPayoutRequestPdf, IPayoutRequestPdf } from '../../html/payout-request.html';
import Config from '../../config';

export default class PayoutRequestPdfService extends HtmlPdfService<PayoutRequestPdf, PayoutRequest, IPayoutRequestPdf> {

  pdfConstructor = PayoutRequestPdf;

  htmlGenerator = createPayoutRequestPdf;

  async getParameters(entity: PayoutRequest): Promise<IPayoutRequestPdf> {
    return {
      reference: `SDS-PR-${String(entity.id).padStart(4, '0')}`,
      requestedBy: [entity.requestedBy.firstName, entity.requestedBy.lastName].filter(Boolean).join(' '),
      accountId: String(entity.requestedBy.id),
      bankAccountName: entity.bankAccountName,
      bankAccountNumber: entity.bankAccountNumber,
      date: entity.createdAt.toLocaleDateString('nl-NL'),
      amount: entity.amount.toFormat(),
      serviceEmail: Config.get().mail.financialResponsible || '',
    };
  }
}
