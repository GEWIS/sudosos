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
 * Ground-truth balance oracle for the balance load test.
 *
 * Recomputes every user's balance by replaying the raw ledger (transactions,
 * sub transactions, sub transaction rows, transfers) once in chronological
 * order. It deliberately shares no code with BalanceService and ignores the
 * `balance` cache table, so it can be used to validate that service.
 *
 * Semantics: the balance of user U at instant T (inclusive) is
 *   - sum(row.amount * revision.priceInclVat) over every row of every
 *     transaction with fromId = U and createdAt <= T (debit), plus
 *   + the same sum over every sub transaction with toId = U whose PARENT
 *     transaction has createdAt <= T (credit), plus
 *   - amountInclVat of transfers with fromId = U and createdAt <= T, plus
 *   + amountInclVat of transfers with toId = U and createdAt <= T.
 * Fines are not part of the amount.
 *
 * Timestamps are handled as integer microseconds since the Unix epoch (UTC),
 * which is safe in a JS number until the year 2255. All money is integer
 * cents in JS numbers; every multiplication and addition is checked with
 * Number.isSafeInteger and the oracle aborts instead of silently losing
 * precision.
 *
 * Snapshot timestamps are always aligned to whole milliseconds, because the
 * service API takes a JS Date. For an event at time e the oracle probes
 * ceilMs(e) (includes e) and ceilMs(e) - 1ms (the latest ms-aligned instant
 * strictly before e).
 *
 * Usage:
 *   source cli/load-gen/env.sh
 *   pnpm loadgen:oracle --db balance_lt --out /tmp/oracle [--timestamps 50] [--seed 1] [--deepUsers 200]
 *
 * Memory: product revision prices are kept in a Map; per sub transaction
 * amount, seller and parent id live in typed arrays indexed by id (about
 * 20 bytes per sub transaction), and all event timestamps are collected once
 * in a Float64Array to choose snapshot instants (8 bytes per event).
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import log4js from 'log4js';
import mysql from 'mysql2';

const logger = log4js.getLogger('BalanceOracle');
logger.level = process.env.LOG_LEVEL ?? 'info';

/** Integer microseconds since the Unix epoch, UTC. */
export type Micros = number;

export const MS: Micros = 1000;

export interface TxRow {
  id: number;
  fromId: number;
  createdAt: Micros;
}

export interface SubTxRow {
  id: number;
  transactionId: number;
  toId: number;
}

export interface SubTxRowRow {
  subTransactionId: number;
  amount: number;
  productId: number;
  revision: number;
}

export interface TransferRow {
  id: number;
  fromId: number | null;
  toId: number | null;
  amountInclVat: number;
  createdAt: Micros;
}

export interface PriceRow {
  productId: number;
  revision: number;
  priceInclVat: number;
}

export interface UserRow {
  id: number;
  type: string;
  deleted: boolean;
}

export interface DeepRow {
  userId: number;
  timestamp: Micros;
  balance: number;
}

/**
 * Receives snapshots while the ledger is replayed. `global` is called once per
 * requested timestamp with the live balance map (users without events are
 * absent and have balance 0); `deep` once per (deep user, timestamp).
 */
export interface ReplaySink {
  global(timestamp: Micros, balances: ReadonlyMap<number, number>): void;
  deep(row: DeepRow): void;
}

function safe(n: number, what: string): number {
  if (!Number.isSafeInteger(n)) {
    throw new Error(`Unsafe integer while computing ${what}: ${n}`);
  }
  return n;
}

/** Parse 'YYYY-MM-DD HH:MM:SS[.ffffff]' or ISO 'YYYY-MM-DDTHH:MM:SS[.ffffff]Z' as UTC microseconds. */
export function parseTimestamp(s: string): Micros {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?Z?$/.exec(s.trim());
  if (!m) throw new Error(`Cannot parse timestamp '${s}'`);
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  const frac = m[7] ? Number(m[7].padEnd(6, '0')) : 0;
  return ms * MS + frac;
}

/** Format microseconds as ISO 8601 UTC with six fractional digits. */
export function formatTimestamp(us: Micros): string {
  const rem = ((us % MS) + MS) % MS;
  const ms = (us - rem) / MS;
  return `${new Date(ms).toISOString().slice(0, 23)}${String(rem).padStart(3, '0')}Z`;
}

/** Smallest ms-aligned instant >= us. */
export function ceilMs(us: Micros): Micros {
  const rem = ((us % MS) + MS) % MS;
  return rem === 0 ? us : us - rem + MS;
}

/** Largest ms-aligned instant strictly before us. */
export function justBefore(us: Micros): Micros {
  return ceilMs(us) - MS;
}

export function priceKey(productId: number, revision: number): string {
  return `${productId}:${revision}`;
}

/**
 * Per sub transaction totals and the sub transactions of each transaction,
 * stored in typed arrays indexed by id.
 */
export class LedgerIndex {
  private readonly subAmount: Float64Array;

  private readonly subTo: Int32Array;

  private readonly subTx: Int32Array;

  private txStart: Int32Array | undefined;

  private txSubs: Int32Array | undefined;

  public rowsSeen = 0;

  public subsSeen = 0;

  public constructor(
    private readonly maxTxId: number,
    private readonly maxSubId: number,
    private readonly prices: ReadonlyMap<string, number>,
  ) {
    this.subAmount = new Float64Array(maxSubId + 1);
    this.subTo = new Int32Array(maxSubId + 1);
    this.subTx = new Int32Array(maxSubId + 1);
  }

  public addSub(sub: SubTxRow): void {
    if (sub.id < 1 || sub.id > this.maxSubId) throw new Error(`sub_transaction id ${sub.id} out of range`);
    if (sub.transactionId < 1 || sub.transactionId > this.maxTxId) {
      throw new Error(`sub_transaction ${sub.id} references transaction ${sub.transactionId} out of range`);
    }
    if (this.subTx[sub.id] !== 0) throw new Error(`Duplicate sub_transaction ${sub.id}`);
    this.subTx[sub.id] = sub.transactionId;
    this.subTo[sub.id] = sub.toId;
    this.subsSeen += 1;
  }

  /** Rows may be added before or after their sub transaction. */
  public addRow(row: SubTxRowRow): void {
    if (row.subTransactionId < 1 || row.subTransactionId > this.maxSubId) {
      throw new Error(`sub_transaction_row references sub_transaction ${row.subTransactionId} out of range`);
    }
    const price = this.prices.get(priceKey(row.productId, row.revision));
    if (price === undefined) {
      throw new Error(`No product_revision (${row.productId}, ${row.revision})`);
    }
    const value = safe(row.amount * price, 'row value');
    this.subAmount[row.subTransactionId] = safe(this.subAmount[row.subTransactionId] + value, 'sub transaction total');
    this.rowsSeen += 1;
  }

  /** Build the transaction -> sub transactions index. Call once, after all subs and rows were added. */
  public finalize(): void {
    const start = new Int32Array(this.maxTxId + 2);
    for (let s = 1; s <= this.maxSubId; s += 1) {
      if (this.subTx[s] !== 0) start[this.subTx[s] + 1] += 1;
    }
    for (let t = 1; t < start.length; t += 1) start[t] += start[t - 1];
    const fill = start.slice(0, this.maxTxId + 1);
    const subs = new Int32Array(this.subsSeen);
    for (let s = 1; s <= this.maxSubId; s += 1) {
      const t = this.subTx[s];
      if (t === 0) {
        if (this.subAmount[s] !== 0) throw new Error(`sub_transaction_row(s) for missing sub_transaction ${s}`);
        continue;
      }
      subs[fill[t]] = s;
      fill[t] += 1;
    }
    this.txStart = start;
    this.txSubs = subs;
  }

  /**
   * Balance changes caused by one transaction. Users with a zero net change
   * (for example a buyer who is also the only seller) are still present.
   */
  public transactionDeltas(tx: TxRow): Map<number, number> {
    if (!this.txStart || !this.txSubs) throw new Error('LedgerIndex.finalize() was not called');
    const deltas = new Map<number, number>();
    let total = 0;
    deltas.set(tx.fromId, 0);
    if (tx.id <= this.maxTxId) {
      for (let i = this.txStart[tx.id]; i < this.txStart[tx.id + 1]; i += 1) {
        const s = this.txSubs[i];
        const amount = this.subAmount[s];
        total = safe(total + amount, 'transaction total');
        const to = this.subTo[s];
        deltas.set(to, safe((deltas.get(to) ?? 0) + amount, 'seller credit'));
      }
    }
    deltas.set(tx.fromId, safe(deltas.get(tx.fromId) - total, 'buyer debit'));
    return deltas;
  }
}

export function transferDeltas(tr: TransferRow): Map<number, number> {
  const deltas = new Map<number, number>();
  if (tr.fromId != null) deltas.set(tr.fromId, -tr.amountInclVat);
  if (tr.toId != null) deltas.set(tr.toId, safe((deltas.get(tr.toId) ?? 0) + tr.amountInclVat, 'transfer'));
  return deltas;
}

/**
 * Applies events in chronological order and emits snapshots. A snapshot at T
 * is emitted just before the first event with createdAt > T is applied, so all
 * events sharing T are always included.
 *
 * Deep users get a snapshot at ceilMs(e) and justBefore(e) for every event e
 * that touches them. justBefore(e) is skipped when an earlier event of the
 * same user falls inside (justBefore(e), e), because that state is no longer
 * available.
 */
export class Replayer {
  public readonly balances = new Map<number, number>();

  private readonly lastTs = new Map<number, Micros>();

  private readonly pendingAfter = new Map<number, Micros>();

  private readonly lastEmitted = new Map<number, Micros>();

  private probeIdx = 0;

  private prevTs = -Infinity;

  public eventCount = 0;

  /**
   * @param probes - Global snapshot instants, sorted ascending and unique.
   * @param deepUsers - Users that get per-event snapshots.
   * @param sink - Receives the snapshots.
   */
  public constructor(
    private readonly probes: readonly Micros[],
    private readonly deepUsers: ReadonlySet<number>,
    private readonly sink: ReplaySink,
  ) {
    for (let i = 1; i < probes.length; i += 1) {
      if (probes[i] <= probes[i - 1]) throw new Error('Snapshot timestamps must be sorted and unique');
    }
  }

  private emitDeep(userId: number, timestamp: Micros) {
    const last = this.lastEmitted.get(userId);
    if (last !== undefined && last >= timestamp) {
      if (last === timestamp) return;
      throw new Error(`Deep snapshots out of order for user ${userId}`);
    }
    this.lastEmitted.set(userId, timestamp);
    this.sink.deep({ userId, timestamp, balance: this.balances.get(userId) ?? 0 });
  }

  public apply(ts: Micros, deltas: ReadonlyMap<number, number>): void {
    if (ts < this.prevTs) {
      throw new Error(`Events out of order: ${formatTimestamp(ts)} after ${formatTimestamp(this.prevTs)}`);
    }
    this.prevTs = ts;
    this.eventCount += 1;

    while (this.probeIdx < this.probes.length && this.probes[this.probeIdx] < ts) {
      this.sink.global(this.probes[this.probeIdx], this.balances);
      this.probeIdx += 1;
    }

    deltas.forEach((delta, userId) => {
      const deep = this.deepUsers.has(userId);
      if (deep) {
        const pending = this.pendingAfter.get(userId);
        if (pending !== undefined && pending < ts) {
          this.emitDeep(userId, pending);
          this.pendingAfter.delete(userId);
        }
        const before = justBefore(ts);
        const last = this.lastTs.get(userId);
        if (last === undefined || last <= before) this.emitDeep(userId, before);
      }

      this.balances.set(userId, safe((this.balances.get(userId) ?? 0) + delta, `balance of user ${userId}`));

      if (deep) {
        this.lastTs.set(userId, ts);
        const after = ceilMs(ts);
        const pending = this.pendingAfter.get(userId);
        if (pending === undefined || pending < after) this.pendingAfter.set(userId, after);
      }
    });
  }

  /**
   * Emit all remaining snapshots.
   * @param untouchedTimestamps - Instants at which deep users without any event get a (zero) snapshot.
   */
  public finish(untouchedTimestamps: readonly Micros[] = []): void {
    while (this.probeIdx < this.probes.length) {
      this.sink.global(this.probes[this.probeIdx], this.balances);
      this.probeIdx += 1;
    }
    this.pendingAfter.forEach((ts, userId) => this.emitDeep(userId, ts));
    this.pendingAfter.clear();
    const sortedUntouched = [...new Set(untouchedTimestamps)].sort((a, b) => a - b);
    this.deepUsers.forEach((userId) => {
      if (this.lastTs.has(userId)) return;
      sortedUntouched.forEach((ts) => this.emitDeep(userId, ts));
    });
  }
}

/** Merge the two chronologically ordered event streams into the replayer. */
export async function runReplay(
  transactions: AsyncIterable<TxRow>,
  transfers: AsyncIterable<TransferRow>,
  ledger: LedgerIndex,
  replayer: Replayer,
  onProgress?: (events: number) => void,
): Promise<void> {
  const txIt = transactions[Symbol.asyncIterator]();
  const trIt = transfers[Symbol.asyncIterator]();
  let tx = await txIt.next();
  let tr = await trIt.next();
  let lastTx = -Infinity;
  let lastTr = -Infinity;
  while (!tx.done || !tr.done) {
    if (!tx.done && (tr.done || tx.value.createdAt <= tr.value.createdAt)) {
      if (tx.value.createdAt < lastTx) throw new Error(`transaction stream out of order at id ${tx.value.id}`);
      lastTx = tx.value.createdAt;
      replayer.apply(tx.value.createdAt, ledger.transactionDeltas(tx.value));
      tx = await txIt.next();
    } else {
      if (tr.value.createdAt < lastTr) throw new Error(`transfer stream out of order at id ${tr.value.id}`);
      lastTr = tr.value.createdAt;
      replayer.apply(tr.value.createdAt, transferDeltas(tr.value));
      tr = await trIt.next();
    }
    if (onProgress && replayer.eventCount % 500000 === 0) onProgress(replayer.eventCount);
  }
}

export interface InMemoryLedger {
  transactions: TxRow[];
  subTransactions: SubTxRow[];
  rows: SubTxRowRow[];
  transfers: TransferRow[];
  prices: PriceRow[];
}

export interface ReplayResult {
  /** timestamp -> userId -> balance (users without events are absent, i.e. 0). */
  snapshots: Map<Micros, Map<number, number>>;
  deep: DeepRow[];
  final: Map<number, number>;
}

function byTime<T extends { createdAt: Micros; id: number }>(a: T, b: T): number {
  return a.createdAt - b.createdAt || a.id - b.id;
}

async function* iterate<T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) yield item;
}

export function buildPriceMap(prices: Iterable<PriceRow>): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of prices) map.set(priceKey(p.productId, p.revision), p.priceInclVat);
  return map;
}

/**
 * Pure replay of an in-memory ledger. Uses exactly the same LedgerIndex and
 * Replayer as the database mode.
 */
export async function replay(
  ledger: InMemoryLedger,
  timestamps: Micros[],
  deepUsers: number[] = [],
  untouchedTimestamps: Micros[] = [],
): Promise<ReplayResult> {
  const maxTxId = ledger.transactions.reduce((m, t) => Math.max(m, t.id), 0);
  const maxSubId = ledger.subTransactions.reduce((m, s) => Math.max(m, s.id), 0);
  const index = new LedgerIndex(maxTxId, maxSubId, buildPriceMap(ledger.prices));
  ledger.subTransactions.forEach((s) => index.addSub(s));
  ledger.rows.forEach((r) => index.addRow(r));
  index.finalize();

  const snapshots = new Map<Micros, Map<number, number>>();
  const deep: DeepRow[] = [];
  const probes = [...new Set(timestamps)].sort((a, b) => a - b);
  const replayer = new Replayer(probes, new Set(deepUsers), {
    global: (ts, balances) => snapshots.set(ts, new Map(balances)),
    deep: (row) => deep.push(row),
  });
  await runReplay(
    iterate([...ledger.transactions].sort(byTime)),
    iterate([...ledger.transfers].sort(byTime)),
    index,
    replayer,
  );
  replayer.finish(untouchedTimestamps);
  return { snapshots, deep, final: new Map(replayer.balances) };
}

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sample<T>(items: T[], n: number, random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export interface ChosenTimestamp {
  timestamp: Micros;
  labels: string[];
}

/**
 * Choose about k ms-aligned snapshot instants from the sorted event timestamps:
 * before everything, the first event, 'now' (the last event), up to 15 tie
 * timestamps (shared by >= 2 events) plus the instant just before some of them,
 * midpoints between neighbouring events, instants spread evenly in time and
 * instants at event quantiles.
 */
export function chooseTimestamps(sorted: Float64Array, k: number, seed: number): ChosenTimestamp[] {
  const chosen = new Map<Micros, Set<string>>();
  const add = (ts: Micros, label: string) => {
    if (!chosen.has(ts)) chosen.set(ts, new Set());
    chosen.get(ts).add(label);
  };
  if (sorted.length === 0) return [];
  const random = rng(seed);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  add(justBefore(min), 'before-all');
  add(ceilMs(min), 'min');
  add(ceilMs(max), 'now');

  // Reservoir samples of tie timestamps and of gaps between distinct neighbours.
  const tieSample: Micros[] = [];
  const gapSample: Micros[] = [];
  let ties = 0;
  let gaps = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] === sorted[i - 1]) {
      if (i >= 2 && sorted[i - 2] === sorted[i]) continue;
      ties += 1;
      if (tieSample.length < 15) tieSample.push(sorted[i]);
      else {
        const j = Math.floor(random() * ties);
        if (j < 15) tieSample[j] = sorted[i];
      }
    } else {
      const mid = Math.floor((sorted[i - 1] + sorted[i]) / 2 / MS) * MS;
      if (mid <= sorted[i - 1] || mid >= sorted[i]) continue;
      gaps += 1;
      if (gapSample.length < 5) gapSample.push(mid);
      else {
        const j = Math.floor(random() * gaps);
        if (j < 5) gapSample[j] = mid;
      }
    }
  }
  tieSample.forEach((ts, i) => {
    add(ceilMs(ts), 'tie');
    if (i < 5) add(justBefore(ts), 'just-before-tie');
  });
  gapSample.forEach((ts) => add(ts, 'midpoint'));

  const remaining = Math.max(0, k - chosen.size);
  const even = Math.ceil(remaining / 2);
  for (let i = 1; i <= even; i += 1) {
    add(Math.floor((min + ((max - min) * i) / (even + 1)) / MS) * MS, 'even-time');
  }
  const quant = remaining - even;
  for (let i = 1; i <= quant; i += 1) {
    add(ceilMs(sorted[Math.floor(((sorted.length - 1) * i) / (quant + 1))]), 'event-quantile');
  }
  return [...chosen.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, labels]) => ({ timestamp, labels: [...labels] }));
}

// ---------------------------------------------------------------------------
// Database mode
// ---------------------------------------------------------------------------

export interface OracleOptions {
  db: string;
  out: string;
  timestamps?: number;
  seed?: number;
  deepUsers?: number;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  skipCrosscheck?: boolean;
}

function connect(opts: OracleOptions): mysql.Connection {
  return mysql.createConnection({
    host: opts.host ?? process.env.TYPEORM_HOST ?? '127.0.0.1',
    port: opts.port ?? Number(process.env.TYPEORM_PORT ?? 3307),
    user: opts.user ?? process.env.TYPEORM_USERNAME ?? 'root',
    password: opts.password ?? process.env.TYPEORM_PASSWORD ?? 'root',
    database: opts.db,
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    timezone: 'Z',
  });
}

function query<T>(conn: mysql.Connection, sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
  });
}

async function* stream<T>(conn: mysql.Connection, sql: string): AsyncGenerator<T> {
  const s = conn.query(sql).stream({ highWaterMark: 5000 });
  for await (const row of s) yield row as T;
}

function num(v: unknown, what: string): number {
  const n = Number(v);
  return safe(n, what);
}

class LineWriter {
  private buffer: string[] = [];

  private readonly fd: number;

  public lines = 0;

  public constructor(public readonly file: string, header: string) {
    this.fd = fs.openSync(file, 'w');
    this.write(header);
  }

  public write(line: string) {
    this.buffer.push(line);
    this.lines += 1;
    if (this.buffer.length >= 20000) this.flush();
  }

  private flush() {
    if (this.buffer.length === 0) return;
    fs.writeSync(this.fd, `${this.buffer.join('\n')}\n`);
    this.buffer = [];
  }

  public close() {
    this.flush();
    fs.closeSync(this.fd);
  }
}

function sha256(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/**
 * Compute the oracle snapshots for a database and write snapshots_all.csv,
 * snapshots_deep.csv, users.csv and meta.json to opts.out.
 */
export async function computeOracle(opts: OracleOptions): Promise<Record<string, unknown>> {
  const started = Date.now();
  const k = opts.timestamps ?? 50;
  const seed = opts.seed ?? 1;
  const deepCount = opts.deepUsers ?? 200;
  fs.mkdirSync(opts.out, { recursive: true });
  const conn = connect(opts);
  const conn2 = connect(opts);
  const lap = (what: string) => logger.info(`${what} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  try {
    await query(conn, "SET time_zone = '+00:00'");
    await query(conn2, "SET time_zone = '+00:00'");

    // Users and prices.
    const users: UserRow[] = (await query<any>(conn, 'SELECT id, type, deleted FROM user ORDER BY id'))
      .map((u) => ({ id: Number(u.id), type: String(u.type), deleted: Number(u.deleted) !== 0 }));
    const userIds = new Set(users.map((u) => u.id));
    const prices = buildPriceMap((await query<any>(conn, 'SELECT productId, revision, priceInclVat FROM product_revision'))
      .map((p) => ({ productId: Number(p.productId), revision: Number(p.revision), priceInclVat: Number(p.priceInclVat) })));
    const [maxes] = await query<any>(conn, `SELECT
      (SELECT COALESCE(MAX(id), 0) FROM transaction) AS maxTx,
      (SELECT COALESCE(MAX(id), 0) FROM sub_transaction) AS maxSub`);
    const maxTxId = Number(maxes.maxTx);
    const maxSubId = Number(maxes.maxSub);
    lap(`Loaded ${users.length} users, ${prices.size} product revisions, maxTx=${maxTxId}, maxSub=${maxSubId}`);

    // Per sub transaction totals.
    const index = new LedgerIndex(maxTxId, maxSubId, prices);
    for await (const s of stream<any>(conn, 'SELECT id, transactionId, toId FROM sub_transaction')) {
      index.addSub({ id: Number(s.id), transactionId: Number(s.transactionId), toId: Number(s.toId) });
    }
    lap(`Indexed ${index.subsSeen} sub transactions`);
    for await (const r of stream<any>(conn,
      'SELECT subTransactionId, amount, productProductId, productRevision FROM sub_transaction_row')) {
      index.addRow({
        subTransactionId: Number(r.subTransactionId),
        amount: Number(r.amount),
        productId: Number(r.productProductId),
        revision: Number(r.productRevision),
      });
    }
    index.finalize();
    lap(`Summed ${index.rowsSeen} sub transaction rows`);

    // All event timestamps, to choose snapshot instants.
    let ts = new Float64Array(1 << 16);
    let n = 0;
    for await (const r of stream<any>(conn,
      'SELECT createdAt FROM transaction UNION ALL SELECT createdAt FROM transfer')) {
      if (n === ts.length) {
        const grown = new Float64Array(ts.length * 2);
        grown.set(ts);
        ts = grown;
      }
      ts[n] = parseTimestamp(r.createdAt);
      n += 1;
    }
    const sorted = ts.slice(0, n).sort();
    let distinct = n > 0 ? 1 : 0;
    let tieTimestamps = 0;
    for (let i = 1; i < n; i += 1) {
      if (sorted[i] !== sorted[i - 1]) distinct += 1;
      else if (i < 2 || sorted[i - 2] !== sorted[i]) tieTimestamps += 1;
    }
    let subMsTimestamps = 0;
    for (let i = 0; i < n; i += 1) if (sorted[i] % MS !== 0) subMsTimestamps += 1;
    const chosen = chooseTimestamps(sorted, k, seed);
    lap(`Read ${n} event timestamps (${distinct} distinct, ${tieTimestamps} shared); chose ${chosen.length} snapshot instants`);

    // Deep users.
    const random = rng(seed + 1);
    const counts = new Map<number, number>();
    const countRows = await query<any>(conn, `SELECT u, SUM(c) AS c FROM (
        SELECT fromId AS u, COUNT(*) AS c FROM transaction GROUP BY fromId
        UNION ALL SELECT toId, COUNT(*) FROM sub_transaction GROUP BY toId
        UNION ALL SELECT fromId, COUNT(*) FROM transfer WHERE fromId IS NOT NULL GROUP BY fromId
        UNION ALL SELECT toId, COUNT(*) FROM transfer WHERE toId IS NOT NULL GROUP BY toId
      ) x GROUP BY u`);
    countRows.forEach((r) => counts.set(Number(r.u), Number(r.c)));
    const selfTrade = (await query<any>(conn, `SELECT DISTINCT t.fromId AS u FROM sub_transaction st
      JOIN transaction t ON t.id = st.transactionId WHERE st.toId = t.fromId LIMIT 1000`)).map((r) => Number(r.u));
    const nullSide = (await query<any>(conn, `SELECT DISTINCT COALESCE(fromId, toId) AS u FROM transfer
      WHERE fromId IS NULL OR toId IS NULL LIMIT 1000`)).map((r) => Number(r.u)).filter((u) => !Number.isNaN(u));
    const deepReasons = new Map<number, string[]>();
    const pick = (ids: number[], max: number, reason: string) => {
      let added = 0;
      for (const id of ids) {
        if (deepReasons.size >= deepCount || added >= max) break;
        if (!userIds.has(id)) continue;
        if (!deepReasons.has(id)) {
          deepReasons.set(id, []);
          added += 1;
        }
        deepReasons.get(id).push(reason);
      }
    };
    const heavy = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(([u]) => u);
    const share = (f: number) => Math.max(1, Math.round(deepCount * f));
    pick(heavy, share(0.2), 'heaviest');
    pick(sample(users.filter((u) => !counts.has(u.id)).map((u) => u.id), share(0.1), random), share(0.1), 'no-events');
    pick(sample(selfTrade, share(0.15), random), share(0.15), 'buyer-is-seller');
    pick(sample(nullSide, share(0.1), random), share(0.1), 'transfer-null-side');
    pick(sample(users.filter((u) => u.deleted).map((u) => u.id), share(0.05), random), share(0.05), 'deleted');
    pick(sample(users.filter((u) => u.type === 'POINT_OF_SALE').map((u) => u.id), share(0.02), random),
      share(0.02), 'point-of-sale');
    pick(sample(users.map((u) => u.id), deepCount, random), deepCount, 'random');
    lap(`Selected ${deepReasons.size} deep users`);

    // Replay.
    const allFile = path.join(opts.out, 'snapshots_all.csv');
    const deepFile = path.join(opts.out, 'snapshots_deep.csv');
    const usersFile = path.join(opts.out, 'users.csv');
    const all = new LineWriter(allFile, 'userId,timestamp,balance,deleted');
    const deepOut = new LineWriter(deepFile, 'userId,timestamp,balance');
    const totals: { timestamp: string; sum: number }[] = [];
    const replayer = new Replayer(chosen.map((c) => c.timestamp), new Set(deepReasons.keys()), {
      global: (t, balances) => {
        const iso = formatTimestamp(t);
        let sum = 0;
        for (const u of users) {
          const b = balances.get(u.id) ?? 0;
          sum += b;
          all.write(`${u.id},${iso},${b},${u.deleted ? 1 : 0}`);
        }
        balances.forEach((_, id) => {
          if (!userIds.has(id)) throw new Error(`Ledger references unknown user ${id}`);
        });
        totals.push({ timestamp: iso, sum: safe(sum, 'total') });
      },
      deep: (row) => deepOut.write(`${row.userId},${formatTimestamp(row.timestamp)},${row.balance}`),
    });
    const txs = (async function* () {
      for await (const r of stream<any>(conn, 'SELECT id, fromId, createdAt FROM transaction ORDER BY createdAt, id')) {
        yield { id: Number(r.id), fromId: Number(r.fromId), createdAt: parseTimestamp(r.createdAt) } as TxRow;
      }
    }());
    const trs = (async function* () {
      for await (const r of stream<any>(conn2,
        'SELECT id, fromId, toId, amountInclVat, createdAt FROM transfer ORDER BY createdAt, id')) {
        yield {
          id: Number(r.id),
          fromId: r.fromId == null ? null : Number(r.fromId),
          toId: r.toId == null ? null : Number(r.toId),
          amountInclVat: Number(r.amountInclVat),
          createdAt: parseTimestamp(r.createdAt),
        } as TransferRow;
      }
    }());
    await runReplay(txs, trs, index, replayer, (e) => lap(`Replayed ${e} events`));
    const nowTs = chosen.find((c) => c.labels.includes('now'))?.timestamp;
    const beforeAll = chosen.find((c) => c.labels.includes('before-all'))?.timestamp;
    replayer.finish([beforeAll, nowTs].filter((t) => t !== undefined));
    all.close();
    deepOut.close();
    lap(`Replayed ${replayer.eventCount} events; wrote ${all.lines - 1} global and ${deepOut.lines - 1} deep snapshots`);

    const usersOut = new LineWriter(usersFile, 'userId,type,deleted');
    users.forEach((u) => usersOut.write(`${u.id},${u.type},${u.deleted ? 1 : 0}`));
    usersOut.close();

    // Conservation: purchases move money between users, so the sum of all
    // balances equals the net amount transferred in from / out to the void.
    const [cons] = await query<any>(conn, `SELECT
      COALESCE(SUM(CASE WHEN fromId IS NULL THEN amountInclVat ELSE 0 END), 0) AS inflow,
      COALESCE(SUM(CASE WHEN toId IS NULL THEN amountInclVat ELSE 0 END), 0) AS outflow
      FROM transfer`);
    const finalSum = [...replayer.balances.values()].reduce((a, b) => safe(a + b, 'final sum'), 0);
    const expectedSum = num(cons.inflow, 'inflow') - num(cons.outflow, 'outflow');
    const conservation = { finalSum, expectedSum, ok: finalSum === expectedSum };
    if (!conservation.ok) logger.error('Conservation check FAILED', conservation);

    // Independent cross-check of the final state with plain aggregates.
    let crosscheck: Record<string, unknown> = { skipped: true };
    if (!opts.skipCrosscheck) {
      const sql = new Map<number, number>();
      const addTo = (rows: any[], sign: number) => rows.forEach((r) => {
        const u = Number(r.u);
        sql.set(u, safe((sql.get(u) ?? 0) + sign * num(r.v, 'crosscheck'), 'crosscheck'));
      });
      addTo(await query<any>(conn, `SELECT t.fromId AS u, SUM(r.amount * p.priceInclVat) AS v FROM transaction t
        JOIN sub_transaction s ON s.transactionId = t.id JOIN sub_transaction_row r ON r.subTransactionId = s.id
        JOIN product_revision p ON p.productId = r.productProductId AND p.revision = r.productRevision
        GROUP BY t.fromId`), -1);
      addTo(await query<any>(conn, `SELECT s.toId AS u, SUM(r.amount * p.priceInclVat) AS v FROM sub_transaction s
        JOIN sub_transaction_row r ON r.subTransactionId = s.id
        JOIN product_revision p ON p.productId = r.productProductId AND p.revision = r.productRevision
        GROUP BY s.toId`), 1);
      addTo(await query<any>(conn, `SELECT fromId AS u, SUM(amountInclVat) AS v FROM transfer
        WHERE fromId IS NOT NULL GROUP BY fromId`), -1);
      addTo(await query<any>(conn, `SELECT toId AS u, SUM(amountInclVat) AS v FROM transfer
        WHERE toId IS NOT NULL GROUP BY toId`), 1);
      let mismatches = 0;
      for (const u of users) {
        if ((sql.get(u.id) ?? 0) !== (replayer.balances.get(u.id) ?? 0)) mismatches += 1;
      }
      crosscheck = { users: users.length, mismatches, ok: mismatches === 0 };
      if (mismatches) logger.error(`Final-state cross-check FAILED for ${mismatches} users`);
      lap('Cross-checked final state with SQL aggregates');
    }

    const meta = {
      db: opts.db,
      generatedAt: new Date().toISOString(),
      runtimeSeconds: (Date.now() - started) / 1000,
      seed,
      counts: {
        users: users.length,
        deletedUsers: users.filter((u) => u.deleted).length,
        pointOfSaleUsers: users.filter((u) => u.type === 'POINT_OF_SALE').length,
        productRevisions: prices.size,
        transactions: Number((await query<any>(conn, 'SELECT COUNT(*) AS c FROM transaction'))[0].c),
        transfers: Number((await query<any>(conn, 'SELECT COUNT(*) AS c FROM transfer'))[0].c),
        subTransactions: index.subsSeen,
        subTransactionRows: index.rowsSeen,
        events: replayer.eventCount,
        distinctEventTimestamps: distinct,
        sharedEventTimestamps: tieTimestamps,
        eventsWithSubMillisecondTimestamp: subMsTimestamps,
        globalSnapshotRows: all.lines - 1,
        deepSnapshotRows: deepOut.lines - 1,
      },
      nowTimestamp: nowTs === undefined ? null : formatTimestamp(nowTs),
      timestamps: chosen.map((c) => ({ timestamp: formatTimestamp(c.timestamp), labels: c.labels })),
      totalsPerTimestamp: totals,
      deepUsers: [...deepReasons.entries()].map(([userId, reasons]) => ({
        userId, reasons, events: counts.get(userId) ?? 0,
      })),
      conservation,
      crosscheck,
      hashes: {
        'snapshots_all.csv': sha256(allFile),
        'snapshots_deep.csv': sha256(deepFile),
        'users.csv': sha256(usersFile),
      },
    };
    fs.writeFileSync(path.join(opts.out, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
    lap(`Done; output in ${opts.out}`);
    return meta;
  } finally {
    conn.end();
    conn2.end();
  }
}

if (require.main === module) {
  program
    .description('Recompute ground-truth balances by replaying the ledger.')
    .option('--db <name>', 'database name', process.env.TYPEORM_DATABASE ?? 'balance_lt')
    .requiredOption('--out <dir>', 'output directory')
    .option('--timestamps <k>', 'number of global snapshot instants', '50')
    .option('--seed <n>', 'seed for deterministic sampling', '1')
    .option('--deepUsers <n>', 'number of users with per-event snapshots', '200')
    .option('--skipCrosscheck', 'skip the SQL aggregate cross-check of the final state')
    .parse();
  const o = program.opts();
  computeOracle({
    db: o.db,
    out: o.out,
    timestamps: Number(o.timestamps),
    seed: Number(o.seed),
    deepUsers: Number(o.deepUsers),
    skipCrosscheck: !!o.skipCrosscheck,
  }).then((meta: any) => {
    const failed = !meta.conservation.ok || meta.crosscheck.ok === false;
    process.exit(failed ? 1 : 0);
  }).catch((e) => {
    logger.error(e);
    process.exit(1);
  });
}
