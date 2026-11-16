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
 * `Wrapped` is a yearly overview of a user's purchases. A {@link Wrapped} row holds the precomputed
 * statistics of one user for one year, so the dashboard does not have to query all transactions.
 *
 * Only active, non-deleted users with `extensiveDataProcessing` get one. A day of the year runs
 * from 06:00 to 06:00, so a night out counts as a single day.
 *
 * The year defaults to `WRAPPED_YEAR` from the configuration. Without it, Wrapped is about the
 * current year, except in January, when it is about the year that just ended.
 *
 * ### Statistics
 * {@link service/wrapped-service!WrappedService.updateWrapped | WrappedService.updateWrapped}
 * computes:
 * - `transactionCount`: the number of transactions.
 * - `transactionHeatmap`: the number of transactions per day of the year.
 * - `transactionMaxDate` and `transactionMaxAmount`: the busiest day and its number of transactions.
 * - `totalSpent`: the money spent. `borrelSpent` is the part spent at points of sale without
 *   authentication, where a cashier rings up the purchases.
 * - `previousTransactionCount` and `previousTotalSpent`: the same totals for the year before.
 * - `transactionPercentile` and `spentPercentile`: the user's rank by transactions and by money
 *   spent, among the users with at least one transaction that year. 10 means the top 10%.
 * - `topProducts`: the five most bought products, each with the user's rank among its buyers.
 * - `categories`: the money spent per product category.
 * - `syncedFrom` and `syncedTo`: the start of the year and the time of the last update.
 *
 * A {@link WrappedOrganMember} row ranks the user among the sellers of an organ they are a member
 * of, by transactions and by turnover. 0 is first place.
 *
 * ### Updates
 * `src/cron.ts` updates all rows every night at 01:45 in December, and once more on January 1st at
 * 06:15 to include New Year's Eve. `POST /users/{id}/wrapped` computes the current Wrapped of one
 * user if it does not exist yet; it never replaces an existing row.
 * `GET /users/{id}/wrapped` returns the requested year, or the most recent one. The
 * {@link internal/server-settings | server setting} `wrappedEnabled` only controls whether the
 * frontends show Wrapped.
 *
 * For API interactions, refer to the [Swagger Documentation](https://sudosos.gewis.nl/api/api-docs/#/users).
 *
 * @module entity/wrapped
 * @mergeTarget
 */
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from 'typeorm';
import { Dinero } from 'dinero.js';
import User from './user/user';
import WrappedOrganMember from './wrapped/wrapped-organ-member';
import DineroTransformer from './transformer/dinero-transformer';

export interface WrappedProduct {
  id: number;
  name: string;
  image?: string;
  count: number;
  totalInclVat: number;
  rank: number;
}

export interface WrappedCategory {
  id: number;
  name: string;
  totalInclVat: number;
}

/**
 * @typedef {BaseEntity} Wrapped
 * @property {number} userId - ID of the user
 * @property {number} year - The year the statistics are about
 * @property {number} transactionCount - Total number of transactions
 * @property {number} previousTransactionCount - Total number of transactions in the year before
 * @property {number} transactionPercentile - Percentile rank of the user's transactions
 * @property {string} transactionMaxDate - Date of the maximum transaction
 * @property {number} transactionMaxAmount - Amount of the maximum transaction
 * @property {number[]} transactionHeatmap - Heatmap data of transactions
 * @property {Dinero.model} totalSpent - Total amount of money spent
 * @property {Dinero.model} previousTotalSpent - Total amount of money spent in the year before
 * @property {Dinero.model} borrelSpent - Amount of money spent at points of sale without authentication
 * @property {number} spentPercentile - Percentile rank of the user's spending
 * @property {Array<object>} topProducts - The most bought products
 * @property {Array<object>} categories - The money spent per product category
 * @property {string} syncedFrom - The starting date from which the data was considered
 * @property {string} syncedTo - The last time the data was synced
 */

@Entity()
export default class Wrapped extends BaseEntity {
  @PrimaryColumn({
    type: 'integer',
  })
  public userId: number;

  @PrimaryColumn({
    type: 'integer',
  })
  public year: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({
    type: 'integer',
  })
  public transactionCount: number;

  @Column({
    type: 'integer',
  })
  public previousTransactionCount: number;

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
    type: 'simple-json',
  })
  public transactionHeatmap: number[];

  @Column({
    type: 'integer',
    transformer: DineroTransformer.Instance,
  })
  public totalSpent: Dinero;

  @Column({
    type: 'integer',
    transformer: DineroTransformer.Instance,
  })
  public previousTotalSpent: Dinero;

  @Column({
    type: 'integer',
    transformer: DineroTransformer.Instance,
  })
  public borrelSpent: Dinero;

  @Column({
    type: 'float',
  })
  public spentPercentile: number;

  @Column({
    type: 'simple-json',
  })
  public topProducts: WrappedProduct[];

  @Column({
    type: 'simple-json',
  })
  public categories: WrappedCategory[];

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