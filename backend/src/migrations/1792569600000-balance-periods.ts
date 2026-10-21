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
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import BalancePeriodService from '../service/balance-period-service';

/**
 * Creates the balance period tables and the ledger indexes the balance queries use, then builds
 * all closed periods from the existing transactions and transfers.
 */
export class BalancePeriods1792569600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'balance_period',
      columns: [
        { name: 'userId', type: 'integer', isPrimary: true, isNullable: false },
        { name: 'grain', type: 'varchar', length: '1', isPrimary: true, isNullable: false },
        { name: 'periodStart', type: 'datetime', isPrimary: true, isNullable: false },
        { name: 'net', type: 'bigint', isNullable: false },
        { name: 'lastTransactionId', type: 'integer', isNullable: true },
        { name: 'lastTransferId', type: 'integer', isNullable: true },
      ],
    }));
    await queryRunner.createIndex('balance_period', new TableIndex({
      name: 'IDX_balance_period_grain_periodStart',
      columnNames: ['grain', 'periodStart', 'userId', 'net', 'lastTransactionId', 'lastTransferId'],
    }));

    await queryRunner.createTable(new Table({
      name: 'balance_period_state',
      columns: [
        { name: 'id', type: 'integer', isPrimary: true, isNullable: false },
        { name: 'closedUntil', type: 'varchar', length: '19', isNullable: false },
        { name: 'builtRowId', type: 'integer', isNullable: false },
        { name: 'builtTransferId', type: 'integer', isNullable: false },
      ],
    }));

    // Index names are the ones TypeORM generates for the @Index declarations on the entities.
    // TmpTransaction inherits the index from Transaction.
    await queryRunner.createIndex('transaction', new TableIndex({
      name: 'IDX_9296bef50108732f37d2c4a056',
      columnNames: ['fromId', 'createdAt'],
    }));
    await queryRunner.createIndex('tmp_transaction', new TableIndex({
      name: 'IDX_758510a9f2150d08fb4ad2cfab',
      columnNames: ['fromId', 'createdAt'],
    }));
    await queryRunner.createIndex('transfer', new TableIndex({
      name: 'IDX_dc0ca7f48f8a9ab82e2eb7b383',
      columnNames: ['fromId', 'createdAt'],
    }));
    await queryRunner.createIndex('transfer', new TableIndex({
      name: 'IDX_7c9d3f9652e220b4582f043fa0',
      columnNames: ['toId', 'createdAt'],
    }));

    await new BalancePeriodService(queryRunner.manager).backfill();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // MariaDB/MySQL drop the implicit index of a foreign key once another index covers its column,
    // so put a plain index named after the foreign key back before dropping the composite one.
    const dropIndex = async (table: string, name: string, column: string) => {
      const fk = (await queryRunner.getTable(table)).foreignKeys
        .find((f) => f.columnNames.length === 1 && f.columnNames[0] === column);
      await queryRunner.createIndex(table, new TableIndex({ name: fk.name, columnNames: [column] }));
      await queryRunner.dropIndex(table, name);
    };
    await dropIndex('transfer', 'IDX_7c9d3f9652e220b4582f043fa0', 'toId');
    await dropIndex('transfer', 'IDX_dc0ca7f48f8a9ab82e2eb7b383', 'fromId');
    await dropIndex('tmp_transaction', 'IDX_758510a9f2150d08fb4ad2cfab', 'fromId');
    await dropIndex('transaction', 'IDX_9296bef50108732f37d2c4a056', 'fromId');
    await queryRunner.dropTable('balance_period_state');
    await queryRunner.dropTable('balance_period');
  }
}
