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
 * Maintenance of the balance period tables (`balance_period`, `balance_period_state`).
 *
 * `balance_period` holds, per user and per closed calendar period, the net balance change and
 * the highest transaction / transfer id that moved it. Periods form a chain of grains, coarse to
 * fine: every closed day has a row, and every fully closed month has a row that is the sum of
 * its days. Periods partition events by `periodStart <= createdAt < periodEnd`, so every event
 * is counted exactly once, whatever timestamp ties exist. Transaction rows are keyed on the
 * parent `transaction.createdAt`.
 *
 * All period arithmetic is done on the naive DATETIME strings the database stores (treated as
 * UTC calendar components in JS), so no time zone or DST conversion happens on stored values.
 *
 * @module balance
 */

import { EntityManager } from 'typeorm';
import log4js, { Logger } from 'log4js';
import WithManager from '../database/with-manager';
import { toMySQLString } from '../helpers/timestamps';
import Config from '../config';

export type Grain = 'month' | 'day';

/** Grains, coarse to fine. Each grain is a union of periods of the next finer grain. */
export const GRAINS: Grain[] = ['month', 'day'];

export const GRAIN_CODE: Record<Grain, string> = { month: 'M', day: 'D' };

const FINEST: Grain = GRAINS[GRAINS.length - 1];

/** A period is only closed this long after it ended, so in-flight inserts have committed. */
const CLOSE_LAG_MS = 60 * 60 * 1000;

/** Naive timestamp before any event. */
export const NEVER = '0000-01-01 00:00:00';

function pad(i: number, n = 2): string {
  return String(i).padStart(n, '0');
}

/** Format the UTC calendar components of `d` as a naive 'YYYY-MM-DD HH:MM:SS' string. */
function fmtNaive(d: Date): string {
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} `
    + `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

/** Parse the date part of a naive datetime string as UTC midnight. */
function parseNaiveDay(s: string): Date {
  return new Date(Date.UTC(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10))));
}

/** Start of the period of `grain` containing the naive datetime `s`. */
export function floorNaive(grain: Grain, s: string): string {
  if (grain === 'day') return `${s.slice(0, 10)} 00:00:00`;
  return `${s.slice(0, 7)}-01 00:00:00`;
}

function addMonthNaive(s: string): string {
  const d = parseNaiveDay(s);
  d.setUTCMonth(d.getUTCMonth() + 1, 1);
  return fmtNaive(d);
}

/** Start of the period of `grain` following the one that starts at `s`. */
function nextNaive(grain: Grain, s: string): string {
  if (grain === 'month') return addMonthNaive(s);
  const d = parseNaiveDay(s);
  d.setUTCDate(d.getUTCDate() + 1);
  return fmtNaive(d);
}

/** Smallest `grain` boundary >= s. */
function ceilNaive(grain: Grain, s: string): string {
  const f = floorNaive(grain, s);
  return f === s ? f : nextNaive(grain, f);
}

export function minStr(a: string, b: string): string {
  return a < b ? a : b;
}

export interface PeriodState {
  closedUntil: string;
  builtRowId: number;
  builtTransferId: number;
}

export interface Dialect {
  sqlite: boolean;
  /** SQL expression: start of the `grain` period containing the datetime expression `x`. */
  floor(grain: Grain, x: string): string;
  /** SQL expression formatting datetime expression `x` as 'YYYY-MM-DD HH:MM:SS'. */
  fmt(x: string): string;
}

export function dialect(): Dialect {
  const sqlite = Config.get().database.isSqlite;
  if (sqlite) {
    return {
      sqlite,
      floor: (g, x) => (g === 'day'
        ? `strftime('%Y-%m-%d 00:00:00', ${x})`
        : `strftime('%Y-%m-01 00:00:00', ${x})`),
      fmt: (x) => `strftime('%Y-%m-%d %H:%M:%S', ${x})`,
    };
  }
  return {
    sqlite,
    floor: (g, x) => (g === 'day'
      ? `DATE_FORMAT(${x}, '%Y-%m-%d 00:00:00')`
      : `DATE_FORMAT(${x}, '%Y-%m-01 00:00:00')`),
    fmt: (x) => `DATE_FORMAT(${x}, '%Y-%m-%d %H:%i:%s')`,
  };
}

export function inList(ids: number[]): string {
  return new Array(ids.length).fill('?').join(',');
}

/** Ledger value of one sub_transaction_row, from the seller's (toId) point of view. */
const ROW_VALUE = 'str.amount * pr.priceInclVat';
const TX_JOINS = 'FROM `transaction` t '
  + 'INNER JOIN sub_transaction st ON st.transactionId = t.id '
  + 'INNER JOIN sub_transaction_row str ON str.subTransactionId = st.id '
  + 'INNER JOIN product_revision pr ON pr.productId = str.productProductId AND pr.revision = str.productRevision ';

/**
 * Ledger events with lo <= createdAt < hi (hi undefined: no upper bound; hiInclusive: <= hi),
 * as rows (userId, ps, net, txId, tfId). When `grain` is given the rows are grouped per
 * (user, period start `ps`); otherwise per user. When `ids` is given only those users are
 * returned. Appends the bound values to `params`.
 */
export function ledgerSql(d: Dialect, params: any[], lo: string, hi: string | undefined, hiInclusive: boolean,
  ids: number[] | undefined, grain?: Grain): string {
  const range = (col: string) => {
    let r = `${col} >= ? `;
    params.push(lo);
    if (hi !== undefined) {
      r += `AND ${col} ${hiInclusive ? '<=' : '<'} ? `;
      params.push(hi);
    }
    return r;
  };
  const ps = (col: string) => (grain ? `${d.floor(grain, col)}` : 'NULL');
  const groupPs = grain ? ', ps' : '';
  const branches: string[] = [];

  if (ids === undefined) {
    // One pass over the rows: aggregate per (buyer, seller[, period]) and unpivot to both sides.
    let inner = `SELECT t.fromId AS fromId, st.toId AS toId, ${ps('t.createdAt')} AS ps, `
      + `SUM(${ROW_VALUE}) AS v, MAX(t.id) AS tx ${TX_JOINS} WHERE ${range('t.createdAt')}`;
    inner += `GROUP BY t.fromId, st.toId${groupPs}`;
    branches.push('SELECT CASE WHEN k.k = 0 THEN a.fromId ELSE a.toId END AS userId, a.ps AS ps, '
      + 'CASE WHEN k.k = 0 THEN -a.v ELSE a.v END AS net, a.tx AS txId, NULL AS tfId '
      + `FROM (${inner}) a CROSS JOIN (SELECT 0 AS k UNION ALL SELECT 1 AS k) k`);
  } else {
    let buyer = `SELECT t.fromId AS userId, ${ps('t.createdAt')} AS ps, -SUM(${ROW_VALUE}) AS net, `
      + `MAX(t.id) AS txId, NULL AS tfId ${TX_JOINS} WHERE t.fromId IN (${inList(ids)}) AND `;
    params.push(...ids);
    buyer += `${range('t.createdAt')}GROUP BY t.fromId${groupPs}`;
    branches.push(buyer);
    let seller = `SELECT st.toId AS userId, ${ps('t.createdAt')} AS ps, SUM(${ROW_VALUE}) AS net, `
      + `MAX(t.id) AS txId, NULL AS tfId ${TX_JOINS} WHERE st.toId IN (${inList(ids)}) AND `;
    params.push(...ids);
    seller += `${range('t.createdAt')}GROUP BY st.toId${groupPs}`;
    branches.push(seller);
  }

  (['fromId', 'toId'] as const).forEach((side) => {
    let q = `SELECT tr.${side} AS userId, ${ps('tr.createdAt')} AS ps, `
      + `${side === 'fromId' ? '-' : ''}SUM(tr.amountInclVat) AS net, NULL AS txId, MAX(tr.id) AS tfId `
      + `FROM transfer tr WHERE tr.${side} IS NOT NULL AND `;
    if (ids !== undefined) {
      q += `tr.${side} IN (${inList(ids)}) AND `;
      params.push(...ids);
    }
    q += `${range('tr.createdAt')}GROUP BY tr.${side}${groupPs}`;
    branches.push(q);
  });

  return branches.join(' UNION ALL ');
}

/**
 * Builds and maintains `balance_period` so it is exact for the ledger as it is now.
 * Used by {@link BalanceService}; nothing else writes these tables.
 */
export default class BalancePeriodService extends WithManager {
  private readonly logger: Logger = log4js.getLogger('BalancePeriodService');

  public constructor(manager?: EntityManager) {
    super(manager);
    this.configureLogger(this.logger);
  }

  /** Period start (naive) up to which everything may be closed right now. */
  private static closeTarget(): string {
    return floorNaive(FINEST, toMySQLString(new Date(Date.now() - CLOSE_LAG_MS)));
  }

  private static async readState(m: EntityManager, lock: boolean): Promise<PeriodState | undefined> {
    const forUpdate = lock && !dialect().sqlite ? ' FOR UPDATE' : '';
    const rows = await m.query(`SELECT closedUntil, builtRowId, builtTransferId FROM balance_period_state WHERE id = 1${forUpdate}`);
    if (rows.length === 0) return undefined;
    return {
      closedUntil: rows[0].closedUntil,
      builtRowId: Number(rows[0].builtRowId),
      builtTransferId: Number(rows[0].builtTransferId),
    };
  }

  private static async maxIds(m: EntityManager): Promise<{ row: number, transfer: number }> {
    const [r] = await m.query('SELECT (SELECT COALESCE(MAX(id), 0) FROM sub_transaction_row) AS r, '
      + '(SELECT COALESCE(MAX(id), 0) FROM transfer) AS t');
    return { row: Number(r.r), transfer: Number(r.t) };
  }

  /**
   * Build finest-grain rows for lo <= createdAt < hi from the ledger (optionally for some users),
   * in chunks of one calendar month to bound temp-table size.
   */
  private static async buildFinest(m: EntityManager, lo: string, hi: string, ids?: number[]): Promise<void> {
    const d = dialect();
    for (let a = lo; a < hi;) {
      // Chunk ends are month boundaries, which are also finest-grain boundaries.
      const b = minStr(addMonthNaive(floorNaive('month', a)), hi);
      const params: any[] = [GRAIN_CODE[FINEST]];
      const sql = 'INSERT INTO balance_period (grain, userId, periodStart, net, lastTransactionId, lastTransferId) '
        + 'SELECT ?, z.userId, z.ps, SUM(z.net), MAX(z.txId), MAX(z.tfId) FROM ('
        + `${ledgerSql(d, params, a, b, false, ids, FINEST)}) z GROUP BY z.userId, z.ps`;
      // eslint-disable-next-line no-await-in-loop
      await m.query(sql, params);
      a = b;
    }
  }

  /**
   * (Re)build coarse rows for every complete coarse period overlapping [from, until), i.e.
   * [floor(from), min(ceil(until), floor(closedUntil))), from the next finer grain's rows.
   */
  private static async buildCoarse(m: EntityManager, from: string, until: string, closedUntil: string,
    ids?: number[]): Promise<void> {
    const d = dialect();
    for (let i = GRAINS.length - 2; i >= 0; i -= 1) {
      const g = GRAINS[i];
      const lo = floorNaive(g, from);
      const hi = minStr(ceilNaive(g, until), floorNaive(g, closedUntil));
      if (lo < hi) {
        const idFilter = ids ? ` AND userId IN (${inList(ids)})` : '';
        // eslint-disable-next-line no-await-in-loop
        await m.query(`DELETE FROM balance_period WHERE grain = ? AND periodStart >= ? AND periodStart < ?${idFilter}`,
          [GRAIN_CODE[g], lo, hi, ...(ids ?? [])]);
        // eslint-disable-next-line no-await-in-loop
        await m.query('INSERT INTO balance_period (grain, userId, periodStart, net, lastTransactionId, lastTransferId) '
          + `SELECT ?, userId, ${d.floor(g, 'periodStart')} AS ps, SUM(net), MAX(lastTransactionId), MAX(lastTransferId) `
          + `FROM balance_period WHERE grain = ? AND periodStart >= ? AND periodStart < ?${idFilter} `
          + `GROUP BY userId, ${d.floor(g, 'periodStart')}`,
        [GRAIN_CODE[g], GRAIN_CODE[GRAINS[i + 1]], lo, hi, ...(ids ?? [])]);
      }
    }
  }

  /** Drop everything and rebuild all closed periods from the ledger, using manager `m`. */
  private async fullBuild(m: EntityManager): Promise<void> {
    const started = Date.now();
    const d = dialect();
    const ids = await BalancePeriodService.maxIds(m);
    const target = BalancePeriodService.closeTarget();
    const [r] = await m.query(`SELECT ${d.fmt('(SELECT MIN(createdAt) FROM `transaction`)')} AS a, `
      + `${d.fmt('(SELECT MIN(createdAt) FROM transfer)')} AS b`);
    const firsts = [r.a, r.b].filter((x) => x != null) as string[];
    await m.query('DELETE FROM balance_period');
    if (firsts.length > 0) {
      const lo = floorNaive(FINEST, firsts.reduce(minStr));
      await BalancePeriodService.buildFinest(m, lo, target);
      await BalancePeriodService.buildCoarse(m, lo, target, target);
    }
    await m.query('DELETE FROM balance_period_state');
    await m.query('INSERT INTO balance_period_state (id, closedUntil, builtRowId, builtTransferId) VALUES (1, ?, ?, ?)',
      [target, ids.row, ids.transfer]);
    this.logger.info('balance_periods.full_build', { closedUntil: target, durationMs: Date.now() - started });
  }

  /**
   * Drop and rebuild all closed periods from the ledger on this service's manager, without
   * opening a transaction of its own. Used by the migration that creates the tables, which
   * already runs in one.
   */
  public async backfill(): Promise<void> {
    await this.fullBuild(this.manager);
  }

  /** Drop and rebuild all closed periods from the ledger, in one DB transaction. */
  public async rebuildAll(): Promise<void> {
    await this.manager.transaction(async (m) => {
      await BalancePeriodService.readState(m, true);
      await this.fullBuild(m);
    });
  }

  /**
   * Rebuild the closed periods overlapping [from, until] (until omitted: up to closedUntil), for
   * all users or only `ids`, in one DB transaction. Arguments are naive datetime strings.
   */
  public async rebuild(from: string, ids?: number[], until?: string): Promise<void> {
    await this.manager.transaction(async (m) => {
      const state = await BalancePeriodService.readState(m, true);
      if (!state) {
        await this.fullBuild(m);
        return;
      }
      await this.repair(m, state, from, ids, until);
    });
  }

  private async repair(m: EntityManager, state: PeriodState, from: string, ids?: number[], until?: string): Promise<void> {
    if (ids?.length === 0) return;
    const lo = floorNaive(FINEST, from < NEVER ? NEVER : from);
    // `until` is inclusive: the finest period containing it is rebuilt too.
    const hi = until === undefined ? state.closedUntil
      : minStr(nextNaive(FINEST, floorNaive(FINEST, until)), state.closedUntil);
    if (lo >= hi) return;
    const idFilter = ids ? ` AND userId IN (${inList(ids)})` : '';
    await m.query(`DELETE FROM balance_period WHERE grain = ? AND periodStart >= ? AND periodStart < ?${idFilter}`,
      [GRAIN_CODE[FINEST], lo, hi, ...(ids ?? [])]);
    await BalancePeriodService.buildFinest(m, lo, hi, ids);
    await BalancePeriodService.buildCoarse(m, lo, hi, state.closedUntil, ids);
    this.logger.debug('balance_periods.rebuilt', { from: lo, until: hi, userCount: ids?.length ?? null });
  }

  /**
   * Make the period table exact for the ledger as it is now, and return closedUntil:
   *  1. close finished periods (advance closedUntil),
   *  2. detect sub_transaction_rows / transfers inserted since the last build whose (parent)
   *     createdAt lies before closedUntil (backdated inserts) and rebuild only the affected users
   *     from the earliest such timestamp.
   * Steps that write run in one DB transaction holding a lock on the state row.
   */
  public async ensureFresh(): Promise<string> {
    const state = await BalancePeriodService.readState(this.manager, false);
    const target = BalancePeriodService.closeTarget();
    if (state && state.closedUntil >= target) {
      const dirty = await BalancePeriodService.findBackdated(this.manager, state);
      if (!dirty) return state.closedUntil;
    }
    return this.manager.transaction(async (m) => {
      let s = await BalancePeriodService.readState(m, true);
      if (!s) {
        await this.fullBuild(m);
        s = await BalancePeriodService.readState(m, false);
      }
      const ids = await BalancePeriodService.maxIds(m);
      const dirty = await BalancePeriodService.findBackdated(m, s);
      if (dirty) {
        this.logger.info('balance_periods.backdated_repair', { from: dirty.from, userCount: dirty.ids.length });
        await this.repair(m, s, dirty.from, dirty.ids);
      }
      if (s.closedUntil < target) {
        await BalancePeriodService.buildFinest(m, s.closedUntil, target);
        await BalancePeriodService.buildCoarse(m, s.closedUntil, target, target);
        this.logger.info('balance_periods.advanced', { from: s.closedUntil, to: target });
        s.closedUntil = target;
      }
      await m.query('UPDATE balance_period_state SET closedUntil = ?, builtRowId = ?, builtTransferId = ? WHERE id = 1',
        [s.closedUntil, ids.row, ids.transfer]);
      return s.closedUntil;
    });
  }

  /** Users touched by rows/transfers newer than the watermark but dated before closedUntil. */
  private static async findBackdated(m: EntityManager, s: PeriodState): Promise<{ from: string, ids: number[] } | undefined> {
    const d = dialect();
    const rows = await m.query(`SELECT t.fromId AS a, st.toId AS b, ${d.fmt('t.createdAt')} AS c `
      + 'FROM sub_transaction_row str INNER JOIN sub_transaction st ON st.id = str.subTransactionId '
      + 'INNER JOIN `transaction` t ON t.id = st.transactionId WHERE str.id > ? AND t.createdAt < ? '
      + `UNION ALL SELECT tr.fromId AS a, tr.toId AS b, ${d.fmt('tr.createdAt')} AS c `
      + 'FROM transfer tr WHERE tr.id > ? AND tr.createdAt < ?',
    [s.builtRowId, s.closedUntil, s.builtTransferId, s.closedUntil]);
    if (rows.length === 0) return undefined;
    const ids = new Set<number>();
    let from = s.closedUntil;
    rows.forEach((r: any) => {
      if (r.a != null) ids.add(Number(r.a));
      if (r.b != null) ids.add(Number(r.b));
      from = minStr(from, r.c);
    });
    return { from, ids: [...ids] };
  }
}
