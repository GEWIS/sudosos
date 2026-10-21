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
 * @module balance
 */

import {
  BaseEntity, Column, Entity, Index, PrimaryColumn,
} from 'typeorm';

/**
 * TypeORM entity for the `balance_period` table. One row holds one user's net balance change
 * over one closed calendar period: a month (`grain = 'M'`) or a day (`grain = 'D'`). A period
 * contains the events with `periodStart <= createdAt < periodEnd`; transaction rows count at
 * the parent transaction's `createdAt`. Every closed day has a row for each user it moved, and
 * every fully closed month has a row that is the sum of its day rows.
 *
 * Rows are derived from {@link Transaction} and {@link Transfer} history by `BalanceService`
 * and are never written by anything else. `periodStart` is the naive datetime the database
 * stores, without time zone conversion.
 *
 * The covering index on (grain, periodStart, userId, net, lastTransactionId, lastTransferId)
 * lets an all-users read range-scan one grain without touching the clustered rows.
 * @typedef BalancePeriod
 * @property {integer} userId.required - The user whose balance moved.
 * @property {string} grain.required - `M` for a month row, `D` for a day row.
 * @property {string} periodStart.required - Start of the period (inclusive).
 * @property {integer} net.required - Net balance change over the period, in cents.
 * @property {integer} lastTransactionId - Highest transaction id that moved the balance
 * in this period.
 * @property {integer} lastTransferId - Highest transfer id that moved the balance in this period.
 */
@Entity()
@Index('IDX_balance_period_grain_periodStart', ['grain', 'periodStart', 'userId', 'net', 'lastTransactionId', 'lastTransferId'])
export default class BalancePeriod extends BaseEntity {
  @PrimaryColumn({ type: 'integer' })
  public userId: number;

  @PrimaryColumn({ type: 'varchar', length: 1 })
  public grain: string;

  @PrimaryColumn({ type: 'datetime' })
  public periodStart: Date;

  @Column({ type: 'bigint' })
  public net: string;

  @Column({ type: 'integer', nullable: true })
  public lastTransactionId: number | null;

  @Column({ type: 'integer', nullable: true })
  public lastTransferId: number | null;
}
