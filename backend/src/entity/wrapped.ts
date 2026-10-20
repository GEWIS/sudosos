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
 * `Wrapped` is a yearly overview of a user's purchases, in the style of Spotify Wrapped.
 * A {@link Wrapped} row holds precomputed statistics for one user, so the dashboard can
 * show them without querying all transactions.
 *
 * ### Who gets a Wrapped
 * Only users that are active, not deleted, and have `extensiveDataProcessing` set get a
 * row or an update. The year is `WRAPPED_YEAR` from the configuration, or the current year
 * if it is not set.
 *
 * Rows are never deleted. A user who later becomes inactive, is deleted, or turns off
 * `extensiveDataProcessing` keeps their last row, and `GET /users/{id}/wrapped` still
 * returns it.
 *
 * ### Statistics
 * {@link service/wrapped-service!WrappedService.updateWrapped | WrappedService.updateWrapped} computes, over the
 * transactions bought by the user in that year:
 * - `transactionCount` -- the number of transactions.
 * - `transactionHeatmap` -- a JSON array of 365 counts, one per day, starting at 1 January.
 * - `transactionMaxDate` and `transactionMaxAmount` -- the busiest day and the number of
 *   transactions on that day. `transactionMaxAmount` is a count, not money.
 * - `transactionPercentile` -- the user's rank among all eligible users by number of
 *   transactions. A value of 10 means the user is in the top 10%.
 * - `spentPercentile` -- the same rank by money spent. It counts transactions of all years,
 *   and its population also includes every other user who ever bought something, including
 *   inactive, deleted and opted-out users.
 * - `syncedFrom` and `syncedTo` -- the start of the year and the time of the last update.
 *
 * ### Organs
 * A {@link WrappedOrganMember} row ranks the user among the people who made sales at one
 * organ's points of sale. The user gets a row for an organ only if they are a member of it,
 * the organ is active, and they created at least one transaction at its points of sale that
 * year. `ordinalTransactionCreated` ranks by the number of sub-transaction rows (product
 * lines) in the transactions they created, not by the number of transactions, so one
 * transaction with five lines outranks three with one line each. `ordinalTurnoverCreated`
 * ranks by turnover. Both start at 0 for the first place.
 *
 * ### When it is computed
 * `src/cron.ts` updates all rows when it starts, and every night at 01:45 during December.
 * `POST /users/{id}/wrapped` updates one user on request, and `GET /users/{id}/wrapped`
 * returns the stored row.
 *
 * The {@link internal/server-settings | server setting} `wrappedEnabled` only tells the
 * frontends whether to show Wrapped. The backend computes and returns it either way.
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