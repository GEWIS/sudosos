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
 * A user's `balance` is the net of every transaction and {@link transfers!Transfer | Transfer}
 * on their account. Positive means SudoSOS owes them; negative means they owe SudoSOS and
 * need to top up.
 *
 * ### Computed, not authoritative
 * The source of truth is {@link transactions!Transaction | Transaction} and
 * {@link transfers!Transfer | Transfer} history. Balances are computed from it on every read.
 * {@link BalancePeriod} rows summarise closed history, so a read does not have to re-sum every
 * {@link transactions/sub-transactions!SubTransactionRow | SubTransactionRow} since a user's
 * first deposit.
 *
 * ### Balance periods
 * `balance_period` holds one row per user per closed calendar period: a row per day, and a row
 * per fully closed month that is the sum of its days. A period contains the events with
 * `periodStart <= createdAt < periodEnd`, so an event exactly on a boundary belongs to the
 * period that starts there and events with the same timestamp always share a period. A
 * transaction row counts at its parent transaction's `createdAt`. {@link BalancePeriodState}
 * records `closedUntil`, the day boundary up to which every event is in the table.
 *
 * {@link BalanceService.getBalances | getBalances} at time T sums
 * - month rows of the months before T's month,
 * - day rows of T's month before T's day,
 * - the ledger from the start of T's day up to and including T.
 *
 * For dates after `closedUntil`, the ledger scan starts at `closedUntil`. Days close one hour
 * after they end.
 *
 * ### Keeping periods exact
 * Every read first closes the days that have ended and checks for backdated inserts: rows or
 * transfers with an id above the watermark of the last build, but dated before `closedUntil`.
 * The periods of the users they touch are rebuilt from that day on. Inserts therefore need no
 * extra call, whatever path writes them.
 *
 * Deletes and updates cannot be detected that way. The services call
 * {@link BalanceService.clearBalanceCache | clearBalanceCache(ids, at)} with the `createdAt`
 * of the changed transaction or transfer, which rebuilds the day and month containing it.
 * Without `at` it rebuilds the users' whole history; without ids it rebuilds everything.
 * {@link BalanceService.rebuildPeriods | rebuildPeriods} rebuilds a date range after closed
 * history was changed with raw SQL. The nightly cron runs
 * {@link BalanceService.updateBalances | updateBalances}, so the first read of a day rarely has
 * to close the previous day.
 *
 * The `balance` table that the `Balance` entity maps is not used to compute balances.
 *
 * ### What moves a balance
 * Sub-transaction rows debit the
 * {@link transactions/sub-transactions!SubTransaction | SubTransaction} buyer (`fromId`) and
 * credit the seller (`toId`, the container owner). Prices are pinned by the
 * {@link catalogue/products!ProductRevision | ProductRevision} in effect at the time, so
 * editing a product later does not retroactively shift balances.
 *
 * Transfers are the explicit movements outside a transaction: Stripe deposits, fine handouts,
 * fine waivers, payout requests, seller payouts, write-offs, invoices.
 *
 * Undoing either of those writes a compensating row; the original stays in the audit trail.
 *
 * ### Fines on the response
 * {@link BalanceResponse} carries the user's outstanding fine amount, the timestamp of the
 * first fine, the number of fines, and any waived amount. These are "now" values, not
 * historical -- ignore them when `date` is in the past.
 *
 * ### Total balances
 * `GET /balances/summary` adds up positive and negative balances across the database, broken
 * down by {@link users!UserType | UserType}. Treasurers use it to reconcile SudoSOS against
 * the bank account.
 *
 * ### POS users
 * {@link users!UserType.POINT_OF_SALE | POS users} do not hold balances of their own. Their
 * sub-transactions credit the container owner, and balance queries filter POS users out at
 * the SQL level, so they never show up in {@link PaginatedBalanceResponse} or
 * {@link TotalBalanceResponse}.
 *
 * @module balance
 * @mergeTarget
 */

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Dinero } from 'dinero.js';
import User from '../user/user';
import Transaction from './transaction';
import Transfer from './transfer';
import DineroTransformer from '../transformer/dinero-transformer';
import BaseEntityWithoutId from '../base-entity-without-id';

/**
 * TypeORM entity for the `balance` table. `BalanceService` does not read or write it; balances
 * are computed from {@link Transaction} and {@link Transfer} history and {@link BalancePeriod}
 * rows.
 * @typedef {BaseEntityWithoutId} Balance
 * @property {User.model} user.required - The account which has this balance
 * @property {Dinero.model} amount.required - The amount of balance a user has.
 * @property {Transaction.model} lastTransaction - The last transaction of this
 * user, used to calculate this balance
 * @property {Transfer.model} lastTransfer - The last transfer of this user,
 * used to calculate this balance
 */
@Entity()
export default class Balance extends BaseEntityWithoutId {
  @PrimaryColumn({ type: 'integer' })
  public readonly userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  public readonly user: User;

  @Column({
    type: 'integer',
    transformer: DineroTransformer.Instance,
  })
  public readonly amount: Dinero;

  @ManyToOne(() => Transaction, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  public readonly lastTransaction?: Transaction;

  @ManyToOne(() => Transfer, { nullable: true, onDelete: 'CASCADE' })
  public readonly lastTransfer?: Transfer;
}
