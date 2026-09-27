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
 * This is the page of seller-payout-pdf-service.
 *
 * @module internal/pdf/seller-payout-pdf-service
 */

import SellerPayout from '../../entity/transactions/payout/seller-payout';
import SellerPayoutPdf from '../../entity/file/seller-payout-pdf';
import { createSellerPayoutPdf, ISellerPayoutPdf } from '../../html/seller-payout.html';
import { SalesReportService } from '../report-service';
import { HtmlPdfService } from './pdf-service';
import { reportToDocumentLines } from '../../helpers/pdf';

export default class SellerPayoutPdfService extends HtmlPdfService<SellerPayoutPdf, SellerPayout, ISellerPayoutPdf> {
  pdfConstructor = SellerPayoutPdf;

  htmlGenerator = createSellerPayoutPdf;

  async getParameters(entity: SellerPayout): Promise<ISellerPayoutPdf> {
    const { startDate, endDate, reference, requestedBy } = entity;
    const report = await new SalesReportService().getReport({
      fromDate: startDate,
      tillDate: endDate,
      forId: requestedBy.id,
    });

    return {
      reference: `SDS-SP-${String(entity.id).padStart(4, '0')}`,
      identifier: String(entity.id),
      description: reference,
      account: [requestedBy.firstName, requestedBy.lastName].filter(Boolean).join(' '),
      customerNumber: String(requestedBy.id),
      startDate: startDate.toLocaleDateString('nl-NL'),
      endDate: endDate.toLocaleDateString('nl-NL'),
      ...reportToDocumentLines(report),
    };
  }
}
