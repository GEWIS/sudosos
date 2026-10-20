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
 * A `report` sums up money over a date range. Reports are computed on request and are not
 * stored: the classes in this module are plain objects, not TypeORM entities.
 *
 * ### Sales and purchase reports
 * A {@link SalesReport} covers what a user sold, a {@link BuyerReport} what a user bought.
 * Both are built by {@link internal/reports!ReportService | ReportService} from the
 * {@link transactions/sub-transactions!SubTransactionRow | SubTransactionRows} of
 * transactions created in `[fromDate, tillDate)`:
 * - {@link internal/reports!SalesReportService | SalesReportService} selects rows whose
 *   sub-transaction pays the user (`subTransaction.to`), so it is used for organs and
 *   other container owners.
 * - {@link internal/reports!BuyerReportService | BuyerReportService} selects rows of
 *   transactions bought by the user (`transaction.from`).
 *
 * A report holds the totals including and excluding VAT, the number of transactions, and
 * a {@link ReportData} breakdown of the same rows by product, category, VAT group, point
 * of sale and container. Each breakdown entry has its own totals. Product entries are per
 * product revision, so a report shows prices as they were at the time of sale. Point of
 * sale and container entries are per point of sale and per container: all revisions are
 * summed into one entry, which is labelled with whichever revision the database returns.
 *
 * The endpoints are `GET /users/{id}/transactions/sales/report` and
 * `GET /users/{id}/transactions/purchases/report`. Their `/pdf` variants render the same
 * report with
 * {@link internal/pdf/user-report-pdf-service!UserReportPdfService | UserReportPdfService},
 * as PDF or HTML. These PDFs are not stored.
 *
 * {@link seller-payouts | Seller payouts} use the sales report to compute the amount that
 * is paid out to an organ.
 *
 * ### Other reports
 * Two reports in this module have their own shape and service:
 * - {@link FineReport} -- the fines handed out and waived in a period, built by
 *   {@link debtors!DebtorService.getFineReport | DebtorService.getFineReport}
 *   (`GET /fines/report`).
 * - {@link InactiveAdministrativeCostReport} -- the administrative costs charged to
 *   inactive users in a period (`GET /inactive-administrative-costs/report`).
 *
 * Both have a `/pdf` variant as well.
 *
 * @module reports
 * @mergeTarget
 */

import Dinero from 'dinero.js';
import ProductRevision from '../product/product-revision';
import VatGroup from '../vat-group';
import ProductCategory from '../product/product-category';
import PointOfSaleRevision from '../point-of-sale/point-of-sale-revision';
import ContainerRevision from '../container/container-revision';

export interface IReport {
  forId: number;

  fromDate: Date;

  tillDate: Date;

  totalExclVat: Dinero.Dinero;

  totalInclVat: Dinero.Dinero;

  transactionCount: number;

  data: ReportData;
}

export class Report implements IReport {
  constructor(init?: Partial<IReport>) {
    Object.assign(this, init);
  }
}

export interface ReportEntry {
  totalExclVat: Dinero.Dinero,
  totalInclVat: Dinero.Dinero
}

export interface ReportProductEntry extends ReportEntry {
  count: number,
  product: ProductRevision,
  image: string | null
}

export interface ReportVatEntry extends ReportEntry {
  vat: VatGroup,
}

export interface ReportCategoryEntry extends ReportEntry {
  category: ProductCategory,
}

export interface ReportPosEntry extends ReportEntry {
  pos: PointOfSaleRevision,
}

export interface ReportContainerEntry extends ReportEntry {
  container: ContainerRevision,
}

export interface ReportData {
  products?: ReportProductEntry[],
  categories?: ReportCategoryEntry[],
  vat?: ReportVatEntry[],
  pos?: ReportPosEntry[],
  containers?: ReportContainerEntry[],
}

export interface Report {
  forId: number,
  fromDate: Date,
  tillDate: Date,
  data: ReportData,
  totalExclVat: Dinero.Dinero,
  totalInclVat: Dinero.Dinero,
  transactionCount: number,
}


export class SalesReport extends Report {
  description: string;
}

export class BuyerReport extends Report {}
