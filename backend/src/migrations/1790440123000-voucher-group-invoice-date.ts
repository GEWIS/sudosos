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

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Adds the invoice date printed on the voucher group statement PDF. Existing
 * groups are backfilled with their creation date, which is what the PDF
 * showed before.
 */
export class VoucherGroupInvoiceDate1790440123000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('voucher_group', new TableColumn({
      name: 'invoiceDate',
      type: 'datetime',
      isNullable: false,
      default: 'CURRENT_TIMESTAMP',
    }));
    await queryRunner.query('UPDATE voucher_group SET invoiceDate = createdAt');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('voucher_group', 'invoiceDate');
  }
}
