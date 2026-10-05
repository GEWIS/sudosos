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
 * This is the page of user-report-pdf-service.
 *
 * @module internal/pdf/user-report-pdf-service
 */

import { BuyerReport, SalesReport } from '../../entity/report/report';
import { PdfService } from './pdf-service';
import { reportToDocumentLines, UserReportType } from '../../helpers/pdf';
import { createUserReportPdf, IUserReportPdf } from '../../html/user-report.html';
import User from '../../entity/user/user';

export default class UserReportPdfService<T extends SalesReport | BuyerReport> extends PdfService<T, IUserReportPdf> {

  render = createUserReportPdf;

  static kind(report: SalesReport | BuyerReport): UserReportType {
    return report instanceof SalesReport ? UserReportType.Sales : UserReportType.Purchases;
  }

  async getParameters(entity: T): Promise<IUserReportPdf> {
    if (!entity.data.products) throw new Error('No products found in report');

    const user = await this.manager.findOne(User, { where: { id: entity.forId } });
    if (!user) throw new Error('User not found');

    return {
      kind: UserReportPdfService.kind(entity),
      account: [user.firstName, user.lastName].filter(Boolean).join(' '),
      customerNumber: String(user.id),
      startDate: entity.fromDate.toLocaleDateString('nl-NL'),
      endDate: entity.tillDate.toLocaleDateString('nl-NL'),
      description: entity instanceof SalesReport ? (entity.description ?? '') : '',
      ...reportToDocumentLines(entity),
    };
  }
}
