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
 * `Wrapped` is a yearly overview of a user's purchases. A {@link Wrapped} row holds precomputed
 * statistics, so the dashboard does not have to query all transactions.
 *
 * Only active, non-deleted users with `extensiveDataProcessing` get one. The year is `WRAPPED_YEAR`
 * from the configuration, or the current year.
 *
 * ### Statistics
 * {@link service/wrapped-service!WrappedService.updateWrapped | WrappedService.updateWrapped}
 * computes:
 * - `transactionCount`: the number of transactions.
 * - `transactionHeatmap`: the number of transactions per day of the year.
 * - `transactionMaxDate` and `transactionMaxAmount`: the busiest day and its number of transactions.
 * - `transactionPercentile` and `spentPercentile`: the user's rank by transactions and by money
 *   spent. 10 means the top 10%.
 * - `syncedFrom` and `syncedTo`: the start of the year and the time of the last update.
 *
 * A {@link WrappedOrganMember} row ranks the user among the sellers of an organ they are a member
 * of, by transactions and by turnover. 0 is first place.
 *
 * ### Updates
 * `src/cron.ts` updates all rows at startup, and every night at 01:45 in December.
 * `POST /users/{id}/wrapped` updates one user. The {@link internal/server-settings | server setting}
 * `wrappedEnabled` only controls whether the frontends show Wrapped.
 *
 * For API interactions, refer to the [Swagger Documentation](https://sudosos.gewis.nl/api/api-docs/#/users).
 *
 * @module entity/wrapped
 * @mergeTarget
 */
import { BaseEntity, Column, Entity, OneToOne, OneToMany, PrimaryColumn, JoinColumn } from 'typeorm';
import User from './user/user';
import WrappedOrganMember from './wrapped/wrapped-organ-member';

/**
 * @typedef {BaseEntity} Wrapped
 * @property {number} userId - ID of the user
 * @property {number} transactionCount - Total number of transactions
 * @property {number} transactionPercentile - Percentile rank of the user's transactions
 * @property {string} transactionMaxDate - Date of the maximum transaction
 * @property {number} transactionMaxAmount - Amount of the maximum transaction
 * @property {number[]} transactionHeatmap - Heatmap data of transactions
 * @property {string} syncedFrom - The starting date from which the data was considered
 * @property {string} syncedTo - The last time the data was synced
 */

@Entity()
export default class Wrapped extends BaseEntity {
  @PrimaryColumn({
    type: 'integer',
  })
  public userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({
    type: 'integer',
  })
  public transactionCount: number;

  @Column({
    type: 'float',
  })
  public transactionPercentile: number;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  public transactionMaxDate: Date | null;

  @Column({
    type: 'integer',
  })
  public transactionMaxAmount: number;

  @Column({
    type: 'text',
  })
  public transactionHeatmap: string;

  @Column({
    type: 'float',
  })
  public spentPercentile: number;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  public syncedFrom: Date | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  public syncedTo: Date | null;

  @OneToMany(() => WrappedOrganMember, (wom) => wom.wrapped)
  public organs: WrappedOrganMember[];
}