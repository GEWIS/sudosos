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

const ADDRESS_COLUMNS = ['addressee', 'attention', 'street', 'postalCode', 'city', 'country'];

/**
 * Adds a purchaser address to voucher groups. Existing groups are backfilled
 * with empty strings; the API requires a non-empty address from now on.
 */
export class VoucherGroupAddress1790440121000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('voucher_group', ADDRESS_COLUMNS.map((name) => new TableColumn({
      name,
      type: 'varchar',
      length: '255',
      isNullable: false,
      default: "''",
    })));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const name of [...ADDRESS_COLUMNS].reverse()) {
      await queryRunner.dropColumn('voucher_group', name);
    }
  }
}
