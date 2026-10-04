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
 * This is the module page of the express-pdf.
 *
 * @module helpers
 */

import { Response } from 'express';
import { ReturnFileType } from './pdf';
import { SalesReport } from '../entity/report/report';
import { BuyerReportService, SalesReportService } from '../service/report-service';
import UserReportPdfService from '../service/pdf/user-report-pdf-service';

type UserReportSource = SalesReportService | BuyerReportService;

/**
 * Send a rendered document as an attachment with the content type and
 * extension that match its file type.
 * @param res - The express response
 * @param buffer - The PDF or HTML bytes
 * @param baseName - File name without extension
 * @param fileType - Whether the buffer is the PDF or the raw HTML
 */
export function sendPdfOrHtml(res: Response, buffer: Buffer, baseName: string, fileType: ReturnFileType) {
  const isPdf = fileType === ReturnFileType.PDF;
  res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${baseName}.${isPdf ? 'pdf' : 'html'}"`);
  res.send(buffer);
}

export function reportPDFhelper(res: Response) {
  return async (service: UserReportSource, filters: { fromDate: Date, tillDate: Date }, description: string, forId: number, fileType: ReturnFileType) => {
    const report = await service.getReport({ ...filters, forId });
    if (report instanceof SalesReport && description) report.description = description;

    const buffer = await new UserReportPdfService().output(report, fileType);
    const from = `${filters.fromDate.getFullYear()}${filters.fromDate.getMonth() + 1}${filters.fromDate.getDate()}`;
    const to = `${filters.tillDate.getFullYear()}${filters.tillDate.getMonth() + 1}${filters.tillDate.getDate()}`;
    sendPdfOrHtml(res, buffer, `${UserReportPdfService.kind(report)}-${from}-${to}`, fileType);
  };
}
