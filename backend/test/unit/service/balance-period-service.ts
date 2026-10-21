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

import { expect } from 'chai';
import { DataSource } from 'typeorm';
import dinero from 'dinero.js';
import Database from '../../../src/database/database';
import Config from '../../../src/config';
import BalanceService from '../../../src/service/balance-service';
import TransactionService from '../../../src/service/transaction-service';
import TransferService from '../../../src/service/transfer-service';
import User, { UserType } from '../../../src/entity/user/user';
import Transaction from '../../../src/entity/transactions/transaction';
import SubTransaction from '../../../src/entity/transactions/sub-transaction';
import SubTransactionRow from '../../../src/entity/transactions/sub-transaction-row';
import Transfer from '../../../src/entity/transactions/transfer';
import PointOfSaleRevision from '../../../src/entity/point-of-sale/point-of-sale-revision';
import ContainerRevision from '../../../src/entity/container/container-revision';
import ProductRevision from '../../../src/entity/product/product-revision';
import BalancePeriodState from '../../../src/entity/transactions/balance-period-state';
import { truncateAllTables } from '../../helpers/database-helpers';
import { finishTestDB } from '../../helpers/test-helpers';
import { UserFactory } from '../../helpers/user-factory';
import { PointOfSaleSeeder, TransactionSeeder, TransferSeeder, UserSeeder } from '../../seed';

/**
 * A Date for the naive timestamp `s` ('YYYY-MM-DDTHH:MM:SS.sss') as the database stores it:
 * UTC on SQLite, local time on MariaDB/MySQL.
 */
function at(s: string): Date {
  return Config.get().database.isSqlite ? new Date(`${s}Z`) : new Date(s);
}

interface Expected {
  amount: number;
  lastTransactionId: number;
  lastTransferId: number;
}

/**
 * Brute-force balance of every non-POS user at `t` (inclusive; undefined = everything): the sum
 * of the value of every sub transaction row (buyer debited, seller credited, keyed on the parent
 * transaction's createdAt) and every transfer.
 */
async function bruteForce(t?: Date): Promise<Map<number, Expected>> {
  const users = await User.find();
  const transactions = await Transaction.find({
    relations: { from: true, subTransactions: { to: true, subTransactionRows: { product: true } } },
  });
  const transfers = await Transfer.find();
  const result = new Map<number, Expected>();
  users.filter((u) => u.type !== UserType.POINT_OF_SALE)
    .forEach((u) => result.set(u.id, { amount: 0, lastTransactionId: -1, lastTransferId: -1 }));
  const add = (userId: number, amount: number, txId?: number, tfId?: number) => {
    const e = result.get(userId);
    if (!e) return;
    e.amount += amount;
    if (txId !== undefined) e.lastTransactionId = Math.max(e.lastTransactionId, txId);
    if (tfId !== undefined) e.lastTransferId = Math.max(e.lastTransferId, tfId);
  };
  const included = (d: Date) => t === undefined || d.getTime() <= t.getTime();

  transactions.filter((tx) => included(tx.createdAt)).forEach((tx) => {
    tx.subTransactions.forEach((st) => st.subTransactionRows.forEach((row) => {
      const value = row.amount * row.product.priceInclVat.getAmount();
      add(tx.from.id, -value, tx.id);
      add(st.to.id, value, tx.id);
    }));
  });
  transfers.filter((tf) => included(tf.createdAt)).forEach((tf) => {
    const value = tf.amountInclVat.getAmount();
    if (tf.fromId != null) add(tf.fromId, -value, undefined, tf.id);
    if (tf.toId != null) add(tf.toId, value, undefined, tf.id);
  });
  return result;
}

describe('BalanceService balance periods', (): void => {
  let ctx: {
    connection: DataSource,
    users: User[],
    posUser: User,
    buyer: User,
    buyer2: User,
    seller: User,
    pos: PointOfSaleRevision,
    container: ContainerRevision,
    product: ProductRevision,
  };

  async function addTx(from: User, to: User, createdAt: Date | undefined, amount = 1): Promise<Transaction> {
    const transaction = {
      from,
      createdBy: from,
      pointOfSale: ctx.pos,
      createdAt,
      updatedAt: createdAt,
      subTransactions: [{
        createdAt,
        updatedAt: createdAt,
        to,
        container: ctx.container,
        subTransactionRows: [{ createdAt, updatedAt: createdAt, product: ctx.product, amount }],
      }],
    } as any as Transaction;
    return Transaction.save(transaction);
  }

  async function addTf(from: User | undefined, to: User | undefined, createdAt: Date | undefined, amount: number): Promise<Transfer> {
    return Object.assign(new Transfer(), {
      createdAt,
      updatedAt: createdAt,
      amountInclVat: dinero({ amount }),
      description: 'balance period test',
      from,
      to,
    }).save();
  }

  /** Compare getBalances and getBalance against the brute force at every instant. */
  async function expectExact(instants: (Date | undefined)[], singleUsers: User[] = []): Promise<void> {
    const service = new BalanceService();
    for (const t of instants) {
      // eslint-disable-next-line no-await-in-loop
      const expected = await bruteForce(t);
      // eslint-disable-next-line no-await-in-loop
      const [records] = await service.getBalances({ date: t, allowDeleted: true });
      const label = t ? t.toISOString() : 'now';
      expect(records.length, `number of balances @ ${label}`).to.equal(expected.size);
      records.forEach((r) => {
        const e = expected.get(r.id);
        expect(e, `user ${r.id} @ ${label}`).to.not.be.undefined;
        expect(r.amount.amount, `amount of user ${r.id} @ ${label}`).to.equal(e.amount);
        expect(r.lastTransactionId, `lastTransactionId of user ${r.id} @ ${label}`).to.equal(e.lastTransactionId);
        expect(r.lastTransferId, `lastTransferId of user ${r.id} @ ${label}`).to.equal(e.lastTransferId);
      });
      for (const u of singleUsers) {
        // eslint-disable-next-line no-await-in-loop
        const single = await service.getBalance(u.id, t);
        expect(single.amount.amount, `getBalance(${u.id}) @ ${label}`).to.equal(expected.get(u.id).amount);
      }
    }
  }

  async function state(): Promise<BalancePeriodState> {
    return BalancePeriodState.findOne({ where: { id: 1 } });
  }

  async function periodRows(): Promise<any[]> {
    const fmt = Config.get().database.isSqlite ? 'periodStart' : "DATE_FORMAT(periodStart, '%Y-%m-%d %H:%i:%s')";
    return ctx.connection.query(`SELECT grain, userId, ${fmt} AS periodStart, net, lastTransactionId, lastTransferId `
      + 'FROM balance_period ORDER BY userId, grain, periodStart');
  }

  const boundaries = [
    '2024-02-29T23:59:59.999', '2024-03-01T00:00:00.000', '2024-03-01T00:00:00.001',
    '2024-03-15T00:00:00.000', '2024-03-15T12:00:00.000', '2024-03-31T23:59:59.999',
    '2024-04-01T00:00:00.000', '2024-05-15T10:00:00.000', '2024-05-15T09:59:59.999',
    '2024-05-16T00:00:00.000', '2024-05-31T23:59:59.999', '2024-06-01T00:00:00.000',
    '2024-07-04T13:37:00.000', '2025-01-01T00:00:00.000',
  ].map(at);
  const instants: (Date | undefined)[] = [undefined, ...boundaries];

  beforeAll(async () => {
    const connection = await Database.initialize();
    await truncateAllTables(connection);

    const users = await new UserSeeder().seed();
    const { pointOfSaleRevisions } = await new PointOfSaleSeeder().seed(users);
    await new TransactionSeeder().seed(users, pointOfSaleRevisions, at('2024-01-01T00:00:00.000'), at('2024-12-31T00:00:00.000'));
    await new TransferSeeder().seed(users, at('2024-01-01T00:00:00.000'), at('2024-12-31T00:00:00.000'));

    const pos = pointOfSaleRevisions.find((p) => p.containers.some((c) => c.products.some((pr) => pr.priceInclVat.getAmount() > 0)));
    const container = pos.containers.find((c) => c.products.some((pr) => pr.priceInclVat.getAmount() > 0));
    const product = container.products.find((pr) => pr.priceInclVat.getAmount() > 0);
    const posUser = await User.findOne({ where: { type: UserType.POINT_OF_SALE } });
    const regular = users.filter((u) => u.type !== UserType.POINT_OF_SALE && !u.deleted);

    ctx = {
      connection,
      users,
      posUser,
      buyer: regular[0],
      buyer2: regular[1],
      seller: regular[2],
      pos,
      container,
      product,
    };

    // Boundaries: on a month start, just before it, on a day start.
    await addTx(ctx.buyer, ctx.seller, at('2024-03-01T00:00:00.000'), 2);
    await addTx(ctx.buyer2, ctx.seller, at('2024-02-29T23:59:59.999'), 3);
    await addTf(undefined, ctx.buyer, at('2024-03-15T00:00:00.000'), 1500);
    await addTx(ctx.buyer, ctx.seller, at('2024-05-31T23:59:59.999'), 1);
    await addTf(ctx.buyer, undefined, at('2024-06-01T00:00:00.000'), 250);
    // Ties: several events at the same instant, for the same and for different users.
    const tie = at('2024-05-15T10:00:00.000');
    await addTx(ctx.buyer, ctx.seller, tie, 1);
    await addTx(ctx.buyer, ctx.seller, tie, 2);
    await addTx(ctx.buyer2, ctx.seller, tie, 1);
    await addTf(ctx.buyer, ctx.buyer2, tie, 125);
    await addTf(undefined, ctx.buyer, tie, 900);
    await addTx(ctx.buyer, ctx.seller, at('2024-05-16T00:00:00.000'), 4);
    // Buyer == seller.
    await addTx(ctx.seller, ctx.seller, at('2024-03-15T12:00:00.000'), 5);
    // A POS user moving money is still not reported.
    await addTf(undefined, ctx.posUser, at('2024-04-01T00:00:00.000'), 700);
    // Live (open) period.
    await addTx(ctx.buyer, ctx.seller, undefined, 1);
    await addTf(undefined, ctx.buyer, undefined, 100);
  });

  afterAll(async () => {
    await finishTestDB(ctx.connection);
  });

  it('should build day and month periods for closed history', async () => {
    await new BalanceService().clearBalanceCache();
    const s = await state();
    expect(s).to.not.be.null;
    // Everything seeded in 2024 is closed, so reads go through the period table.
    expect(s.closedUntil.localeCompare('2025-01-01 00:00:00')).to.equal(1);

    const rows = await periodRows();
    const months = rows.filter((r) => r.grain === 'M');
    const days = rows.filter((r) => r.grain === 'D');
    expect(months.length).to.be.greaterThan(0);
    expect(days.length).to.be.greaterThan(months.length);
    // A month row is the sum of its day rows.
    months.forEach((m) => {
      const sum = days.filter((d) => d.userId === m.userId && d.periodStart.slice(0, 7) === m.periodStart.slice(0, 7))
        .reduce((acc, d) => acc + Number(d.net), 0);
      expect(sum, `month ${m.periodStart} of user ${m.userId}`).to.equal(Number(m.net));
    });
    // The boundary events land in the period that starts at their timestamp.
    expect(days.some((d) => d.userId === ctx.buyer.id && d.periodStart === '2024-03-01 00:00:00')).to.be.true;
    expect(days.some((d) => d.userId === ctx.buyer2.id && d.periodStart === '2024-02-29 00:00:00')).to.be.true;
  });

  it('should agree with a brute-force recomputation on boundaries, ties and mid-day dates', async () => {
    const tie = at('2024-05-15T10:00:00.000');
    await expectExact([...instants, tie, new Date(tie.getTime() - 1)],
      [ctx.buyer, ctx.buyer2, ctx.seller]);
  });

  it('should count buyer == seller transactions on both sides', async () => {
    const before = await new BalanceService().getBalance(ctx.seller.id, at('2024-03-15T11:59:59.999'));
    const after = await new BalanceService().getBalance(ctx.seller.id, at('2024-03-15T12:00:00.000'));
    expect(after.amount.amount).to.equal(before.amount.amount);
    expect(after.lastTransactionId).to.be.greaterThan(before.lastTransactionId);
  });

  it('should exclude POS users', async () => {
    const [records] = await new BalanceService().getBalances({ allowDeleted: true });
    expect(records.find((r) => r.id === ctx.posUser.id)).to.be.undefined;
    expect(records.some((r) => r.type === UserType.POINT_OF_SALE)).to.be.false;
  });

  it('should return zero for a user without events', async () => {
    const user = await (await UserFactory()).get();
    const balance = await new BalanceService().getBalance(user.id, at('2024-06-01T00:00:00.000'));
    expect(balance.amount.amount).to.equal(0);
    expect(balance.lastTransactionId).to.equal(-1);
    expect(balance.lastTransferId).to.equal(-1);
    expect(balance.lastTransactionDate).to.be.null;
  });

  it('should read closed history from the period table', async () => {
    const service = new BalanceService();
    const march = Config.get().database.isSqlite ? '2024-03-01 00:00:00' : '2024-03-01';
    await ctx.connection.query("UPDATE balance_period SET net = net + 100000 WHERE grain = 'M' AND userId = ? AND periodStart = ?",
      [ctx.buyer.id, march]);
    const expectedApril = (await bruteForce(at('2024-04-01T00:00:00.000'))).get(ctx.buyer.id).amount;
    const expectedMid = (await bruteForce(at('2024-03-20T12:00:00.000'))).get(ctx.buyer.id).amount;

    // From April on the March month row is used; within March only its day rows are.
    expect((await service.getBalance(ctx.buyer.id, at('2024-04-01T00:00:00.000'))).amount.amount).to.equal(expectedApril + 100000);
    expect((await service.getBalance(ctx.buyer.id, at('2024-03-20T12:00:00.000'))).amount.amount).to.equal(expectedMid);

    await service.rebuildPeriods(at('2024-03-10T00:00:00.000'), [ctx.buyer.id], at('2024-03-10T00:00:00.000'));
    expect((await service.getBalance(ctx.buyer.id, at('2024-04-01T00:00:00.000'))).amount.amount).to.equal(expectedApril);
  });

  it('should detect a backdated insert into a closed month on the next read', async () => {
    const before = await state();
    await addTx(ctx.buyer2, ctx.seller, at('2024-03-10T12:00:00.000'), 3);
    await addTf(ctx.seller, ctx.buyer2, at('2024-03-10T12:00:00.000'), 42);
    await expectExact(instants, [ctx.buyer2, ctx.seller]);
    const after = await state();
    expect(after.builtRowId).to.be.greaterThan(before.builtRowId);
    expect(after.builtTransferId).to.be.greaterThan(before.builtTransferId);
  });

  it('should detect a row added to an old sub transaction', async () => {
    const old = await SubTransaction.findOne({
      where: { transaction: { createdAt: at('2024-03-01T00:00:00.000') } },
      relations: { transaction: true },
    });
    expect(old).to.not.be.null;
    await SubTransactionRow.save({ subTransaction: old, product: ctx.product, amount: 2 } as any);
    await expectExact(instants, [ctx.buyer, ctx.seller]);
  });

  it('should only fix a deleted transaction after clearBalanceCache(ids, at)', async () => {
    const tx = await addTx(ctx.buyer, ctx.seller, at('2024-07-04T13:37:00.000'), 6);
    const date = at('2024-08-01T00:00:00.000');
    await expectExact([date]);

    await SubTransactionRow.delete(tx.subTransactions[0].subTransactionRows.map((r) => r.id));
    await SubTransaction.delete(tx.subTransactions[0].id);
    await Transaction.delete(tx.id);
    // Deletes are not visible to the read path until the services invalidate the period.
    const expected = (await bruteForce(date)).get(ctx.buyer.id).amount;
    expect((await new BalanceService().getBalance(ctx.buyer.id, date)).amount.amount).to.not.equal(expected);

    await new BalanceService().clearBalanceCache([ctx.buyer.id, ctx.seller.id], tx.createdAt);
    await expectExact(instants, [ctx.buyer, ctx.seller]);
  });

  it('should rebuild only the affected periods when the services delete closed history', async () => {
    const rowsBefore = await periodRows();
    const tx = await addTx(ctx.buyer2, ctx.seller, at('2024-09-09T09:09:09.000'), 2);
    const tf = await addTf(ctx.buyer2, ctx.seller, at('2024-09-10T10:00:00.000'), 333);
    await expectExact([at('2024-10-01T00:00:00.000')]);

    await new TransactionService().deleteTransaction(tx.id);
    await new TransferService().deleteTransfer(tf.id);
    await expectExact(instants, [ctx.buyer2, ctx.seller]);
    expect(await periodRows()).to.deep.equal(rowsBefore);
  });

  it('should rebuild all users of a user list with clearBalanceCache(ids)', async () => {
    await ctx.connection.query("UPDATE balance_period SET net = net + 1 WHERE userId = ? AND grain = 'D'", [ctx.seller.id]);
    await new BalanceService().clearBalanceCache([ctx.seller.id]);
    await expectExact(instants, [ctx.seller]);
  });

  it('should advance closedUntil on read and in updateBalances', async () => {
    const target = (await state()).closedUntil;
    const rowsBefore = await periodRows();
    const stale = Config.get().database.isSqlite ? '2024-05-01 00:00:00' : '2024-05-01';
    await ctx.connection.query("UPDATE balance_period_state SET closedUntil = '2024-05-01 00:00:00'");
    await ctx.connection.query("DELETE FROM balance_period WHERE (grain = 'D' AND periodStart >= ?) OR (grain = 'M' AND periodStart >= ?)",
      [stale, stale]);
    await expectExact(instants, [ctx.buyer]);
    expect((await state()).closedUntil).to.equal(target);
    expect(await periodRows()).to.deep.equal(rowsBefore);

    await ctx.connection.query("UPDATE balance_period_state SET closedUntil = '2024-05-01 00:00:00'");
    await ctx.connection.query("DELETE FROM balance_period WHERE (grain = 'D' AND periodStart >= ?) OR (grain = 'M' AND periodStart >= ?)",
      [stale, stale]);
    await new BalanceService().updateBalances({});
    expect((await state()).closedUntil).to.equal(target);
    expect(await periodRows()).to.deep.equal(rowsBefore);
  });

  it('should produce the same periods from a full rebuild', async () => {
    const rowsBefore = await periodRows();
    await new BalanceService().clearBalanceCache();
    expect(await periodRows()).to.deep.equal(rowsBefore);
    await expectExact(instants);
  });
});
