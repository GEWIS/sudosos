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

import {
  MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex,
} from 'typeorm';

/**
 * Adds a stored statement PDF to voucher groups, mirroring seller_payout_pdf.
 */
export class VoucherGroupPdf1790440122000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'voucher_group_pdf',
      engine: 'InnoDB',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'hash', type: 'varchar', length: '255', isNullable: false },
        { name: 'downloadName', type: 'varchar', length: '255', isNullable: false },
        { name: 'location', type: 'varchar', length: '255', isNullable: false },
        { name: 'createdAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', isNullable: false },
        { name: 'updatedAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)', isNullable: false },
        { name: 'version', type: 'int', isNullable: false },
        { name: 'createdById', type: 'int', isNullable: false },
      ],
    }), true);
    await queryRunner.createForeignKey('voucher_group_pdf', new TableForeignKey({
      name: 'FK_df75e377b1a94ea07567e3fa1f2',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      columnNames: ['createdById'],
      referencedTableName: 'user',
      referencedColumnNames: ['id'],
    }));

    await queryRunner.addColumn('voucher_group', new TableColumn({
      name: 'pdfId',
      type: 'int',
      isNullable: true,
    }));
    await queryRunner.createIndex('voucher_group', new TableIndex({
      name: 'REL_e8920d4a6b3d15f9d898dddd64',
      columnNames: ['pdfId'],
      isUnique: true,
    }));
    await queryRunner.createForeignKey('voucher_group', new TableForeignKey({
      name: 'FK_e8920d4a6b3d15f9d898dddd641',
      onDelete: 'RESTRICT',
      onUpdate: 'NO ACTION',
      columnNames: ['pdfId'],
      referencedTableName: 'voucher_group_pdf',
      referencedColumnNames: ['id'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('voucher_group', 'FK_e8920d4a6b3d15f9d898dddd641');
    await queryRunner.dropIndex('voucher_group', 'REL_e8920d4a6b3d15f9d898dddd64');
    await queryRunner.dropColumn('voucher_group', 'pdfId');

    await queryRunner.dropTable('voucher_group_pdf', true, true);
  }
}
