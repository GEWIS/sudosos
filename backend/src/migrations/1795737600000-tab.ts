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
 * @module
 * @hidden
 */

import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const timestamps = [
  { name: 'createdAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', isNullable: false },
  { name: 'updatedAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)', isNullable: false },
  { name: 'version', type: 'int', isNullable: false },
];

export class Tab1795737600000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'tab_receipt_pdf',
      engine: 'InnoDB',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'hash', type: 'varchar', length: '255', isNullable: false },
        { name: 'downloadName', type: 'varchar', length: '255', isNullable: false },
        { name: 'location', type: 'varchar', length: '255', isNullable: false },
        { name: 'createdById', type: 'int', isNullable: false },
        ...timestamps,
      ],
    }), true);
    await queryRunner.createForeignKey('tab_receipt_pdf', new TableForeignKey({
      columnNames: ['createdById'],
      referencedTableName: 'user',
      referencedColumnNames: ['id'],
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    }));

    await queryRunner.createTable(new Table({
      name: 'tab',
      engine: 'InnoDB',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        ...timestamps,
        { name: 'name', type: 'varchar', length: '64', isNullable: false },
        { name: 'contactName', type: 'varchar', length: '64', isNullable: false },
        { name: 'contactEmail', type: 'varchar', length: '64', isNullable: false },
        { name: 'userId', type: 'int', isNullable: false },
        { name: 'createdById', type: 'int', isNullable: false },
        { name: 'lockedAt', type: 'datetime', isNullable: true },
        { name: 'paidAt', type: 'datetime', isNullable: true },
        { name: 'invoicedAt', type: 'datetime', isNullable: true },
        { name: 'invoicedById', type: 'int', isNullable: true },
        { name: 'cancelledAt', type: 'datetime', isNullable: true },
        { name: 'transferId', type: 'int', isNullable: true },
        { name: 'pdfId', type: 'int', isNullable: true },
      ],
    }), true);
    await queryRunner.createIndices('tab', [
      new TableIndex({ name: 'REL_tab_userId', columnNames: ['userId'], isUnique: true }),
      new TableIndex({ name: 'REL_tab_transferId', columnNames: ['transferId'], isUnique: true }),
      new TableIndex({ name: 'REL_tab_pdfId', columnNames: ['pdfId'], isUnique: true }),
    ]);
    await queryRunner.createForeignKeys('tab', [
      new TableForeignKey({
        columnNames: ['userId'], referencedTableName: 'user', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['createdById'], referencedTableName: 'user', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['invoicedById'], referencedTableName: 'user', referencedColumnNames: ['id'], onDelete: 'SET NULL', onUpdate: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['transferId'], referencedTableName: 'transfer', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['pdfId'], referencedTableName: 'tab_receipt_pdf', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'NO ACTION',
      }),
    ]);

    await queryRunner.createTable(new Table({
      name: 'tab_payment_attempt',
      engine: 'InnoDB',
      columns: [
        { name: 'tabId', type: 'int', isPrimary: true, isNullable: false },
        { name: 'paymentIntentId', type: 'int', isPrimary: true, isNullable: false },
        { name: 'processedByTerminal', type: 'varchar', length: '64', isNullable: false },
        ...timestamps,
      ],
    }), true);
    await queryRunner.createIndex('tab_payment_attempt', new TableIndex({
      name: 'IDX_tab_payment_attempt_paymentIntentId',
      columnNames: ['paymentIntentId'],
      isUnique: true,
    }));
    await queryRunner.createForeignKeys('tab_payment_attempt', [
      new TableForeignKey({
        columnNames: ['tabId'], referencedTableName: 'tab', referencedColumnNames: ['id'], onDelete: 'RESTRICT', onUpdate: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['paymentIntentId'], referencedTableName: 'stripe_payment_intent', referencedColumnNames: ['id'], onDelete: 'CASCADE', onUpdate: 'NO ACTION',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tab_payment_attempt', true, true, true);
    await queryRunner.dropTable('tab', true, true, true);
    await queryRunner.dropTable('tab_receipt_pdf', true, true, true);
  }
}
