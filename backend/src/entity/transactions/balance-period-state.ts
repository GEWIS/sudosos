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
  BaseEntity, Column, Entity, PrimaryColumn,
} from 'typeorm';

/**
 * TypeORM entity for the `balance_period_state` table. It holds a single row (`id = 1`) that
 * describes how far {@link BalancePeriod} has been built.
 *
 * - `closedUntil` is a naive `YYYY-MM-DD HH:MM:SS` day boundary: every event with
 *   `createdAt < closedUntil` is summed in `balance_period`.
 * - `builtRowId` and `builtTransferId` are the highest `sub_transaction_row` and `transfer`
 *   ids at the last build. A newer row dated before `closedUntil` is a backdated insert, and
 *   `BalanceService` rebuilds the periods of the users it touches.
 *
 * Writers lock this row (`SELECT ... FOR UPDATE` on MariaDB/MySQL) for the duration of a build.
 * @typedef BalancePeriodState
 * @property {integer} id.required - Always 1.
 * @property {string} closedUntil.required - Every event before this boundary is in `balance_period`.
 * @property {integer} builtRowId.required - Highest sub transaction row id at the last build.
 * @property {integer} builtTransferId.required - Highest transfer id at the last build.
 */
@Entity()
export default class BalancePeriodState extends BaseEntity {
  @PrimaryColumn({ type: 'integer' })
  public id: number;

  @Column({ type: 'varchar', length: 19 })
  public closedUntil: string;

  @Column({ type: 'integer' })
  public builtRowId: number;

  @Column({ type: 'integer' })
  public builtTransferId: number;
}
