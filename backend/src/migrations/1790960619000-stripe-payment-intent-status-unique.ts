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
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

const TABLE = 'stripe_payment_intent_status';
// The name TypeORM's naming strategy gives the index declared on the entity.
const INDEX = 'IDX_26901e09679afbdf4db1d65b93';
const FOREIGN_KEY = 'FK_8f454dd76a0725b815a5c046aae';

/**
 * Add the unique index on (stripePaymentIntentId, state) that the
 * StripePaymentIntentStatus entity declares, but no migration created.
 */
export class StripePaymentIntentStatusUnique1790960619000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(TABLE);
    if (table?.indices.some((index) => index.name === INDEX)) return;

    // Keep only the oldest of any duplicate statuses, or the index cannot be
    // created. The extra subquery lets MySQL delete from the table it reads.
    await queryRunner.query(`
      DELETE FROM ${TABLE} WHERE id NOT IN (
        SELECT id FROM (
          SELECT MIN(id) AS id FROM ${TABLE} GROUP BY stripePaymentIntentId, state
        ) AS keep
      )`);

    await queryRunner.createIndex(TABLE, new TableIndex({
      name: INDEX,
      columnNames: ['stripePaymentIntentId', 'state'],
      isUnique: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // MySQL dropped the foreign key's own index when the unique index took
    // over, so restore it before the unique index can go.
    await queryRunner.createIndex(TABLE, new TableIndex({
      name: FOREIGN_KEY,
      columnNames: ['stripePaymentIntentId'],
    }));
    await queryRunner.dropIndex(TABLE, INDEX);
  }
}
