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
 * Compare BalanceService against the output of oracle.ts.
 *
 * For every global snapshot timestamp it calls getBalances({ date, allowDeleted: true })
 * once and diffs all users; for the deep snapshots it calls getBalance(userId, date).
 * POINT_OF_SALE users are excluded by the service and count as "expected missing".
 *
 * The process runs with TZ=UTC: the database stores naive DATETIMEs that the
 * oracle reads as UTC, and the service formats dates in the local time zone.
 *
 * Usage:
 *   source cli/load-gen/env.sh
 *   pnpm loadgen:compare --oracle /tmp/oracle [--limit 2000] [--now] [--cache-clear]
 *
 * Exits with 1 when any mismatch is found.
 */

import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { program } from 'commander';
import dinero, { Currency } from 'dinero.js';
import log4js from 'log4js';
import Database, { AppDataSource } from '../../src/database/database';
import Config from '../../src/config';
import ServerSettingsStore from '../../src/server-settings/server-settings-store';
import { loadCandidate } from './impl';
import { MS, parseTimestamp } from './oracle';

process.env.TZ = 'UTC';

const logger = log4js.getLogger('BalanceCompare');
logger.level = process.env.LOG_LEVEL ?? 'info';

interface Mismatch {
  kind: 'value' | 'missing-in-service' | 'extra-in-service';
  source: 'all' | 'deep' | 'now';
  userId: number;
  timestamp: string;
  oracle: number | null;
  service: number | null;
}

interface UserInfo {
  type: string;
  deleted: boolean;
}

function readCsv(file: string): string[][] {
  return fs.readFileSync(file, 'utf8').split('\n').slice(1).filter((l) => l.length > 0).map((l) => l.split(','));
}

/** Stream a (possibly multi-GB) CSV and return `limit` evenly spaced rows, or all rows without a limit. */
async function readCsvSampled(file: string, limit?: number): Promise<string[][]> {
  const lines = async (fn: (line: string, i: number) => void) => {
    let i = -1;
    const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
      if (i >= 0 && line.length > 0) fn(line, i);
      i += 1;
    }
  };
  let total = 0;
  await lines(() => { total += 1; });
  const stride = limit && total > limit ? total / limit : 1;
  const rows: string[][] = [];
  let next = 0;
  await lines((line, i) => {
    if (i >= Math.floor(next)) {
      rows.push(line.split(','));
      next += stride;
    }
  });
  return rows;
}

function toDate(iso: string): Date | undefined {
  const us = parseTimestamp(iso);
  if (us % MS !== 0) return undefined;
  return new Date(us / MS);
}

export async function compare(opts: {
  oracle: string; limit?: number; now?: boolean; cacheClear?: boolean; impl?: string;
}): Promise<number> {
  const started = Date.now();
  const meta = JSON.parse(fs.readFileSync(path.join(opts.oracle, 'meta.json'), 'utf8'));
  const users = new Map<number, UserInfo>();
  readCsv(path.join(opts.oracle, 'users.csv')).forEach(([id, type, deleted]) => {
    users.set(Number(id), { type, deleted: deleted === '1' });
  });
  const labels = new Map<string, string[]>(meta.timestamps.map((t: any) => [t.timestamp, t.labels]));

  const { service, prepare } = await loadCandidate(opts.impl);
  if (prepare) {
    const t0 = Date.now();
    await prepare(AppDataSource);
    logger.info(`Candidate prepare took ${Date.now() - t0} ms`);
  }
  if (opts.cacheClear) {
    const res = await AppDataSource.query('DELETE FROM balance');
    logger.info(`Cleared balance cache (${res?.affectedRows ?? '?'} rows)`);
  }

  const mismatches: Mismatch[] = [];
  let comparisons = 0;
  let expectedMissing = 0;
  let skippedSubMs = 0;
  const timings: { source: string; timestamp: string; ms: number }[] = [];

  const diffAll = (source: 'all' | 'now', iso: string, oracle: Map<number, number>, got: Map<number, number>) => {
    oracle.forEach((expected, userId) => {
      const actual = got.get(userId);
      if (actual === undefined) {
        if (users.get(userId)?.type === 'POINT_OF_SALE') expectedMissing += 1;
        else mismatches.push({ kind: 'missing-in-service', source, userId, timestamp: iso, oracle: expected, service: null });
        return;
      }
      comparisons += 1;
      if (actual !== expected) {
        mismatches.push({ kind: 'value', source, userId, timestamp: iso, oracle: expected, service: actual });
      }
    });
    got.forEach((actual, userId) => {
      if (!oracle.has(userId)) {
        mismatches.push({ kind: 'extra-in-service', source, userId, timestamp: iso, oracle: null, service: actual });
      }
    });
  };

  const fetchAll = async (date?: Date) => {
    const t0 = Date.now();
    const [balances] = await service.getBalances({ date, allowDeleted: true });
    const got = new Map<number, number>();
    balances.forEach((b) => got.set(b.id, b.amount.amount));
    return { got, ms: Date.now() - t0 };
  };

  // Global snapshots.
  const byTs = new Map<string, Map<number, number>>();
  readCsv(path.join(opts.oracle, 'snapshots_all.csv')).forEach(([userId, ts, balance]) => {
    if (!byTs.has(ts)) byTs.set(ts, new Map());
    byTs.get(ts).set(Number(userId), Number(balance));
  });

  if (opts.now) {
    const iso = meta.nowTimestamp as string;
    const { got, ms } = await fetchAll();
    timings.push({ source: 'now', timestamp: 'now', ms });
    diffAll('now', iso, byTs.get(iso), got);
    logger.info(`now: getBalances() took ${ms}ms`);
  } else {
    for (const [iso, oracle] of byTs) {
      const date = toDate(iso);
      if (!date) {
        skippedSubMs += oracle.size;
        continue;
      }
      const { got, ms } = await fetchAll(date);
      timings.push({ source: 'all', timestamp: iso, ms });
      diffAll('all', iso, oracle, got);
      logger.info(`${iso} [${(labels.get(iso) ?? []).join(',')}]: ${got.size} balances in ${ms}ms`);
    }

    // Deep snapshots, sampled evenly when --limit is set.
    const t0 = Date.now();
    const deep = await readCsvSampled(path.join(opts.oracle, 'snapshots_deep.csv'), opts.limit);
    for (let i = 0; i < deep.length; i += 1) {
      const [u, iso, b] = deep[i];
      const userId = Number(u);
      const expected = Number(b);
      const date = toDate(iso);
      if (!date) {
        skippedSubMs += 1;
        continue;
      }
      const res = await service.getBalance(userId, date);
      if (!res) {
        if (users.get(userId)?.type === 'POINT_OF_SALE') expectedMissing += 1;
        else mismatches.push({ kind: 'missing-in-service', source: 'deep', userId, timestamp: iso, oracle: expected, service: null });
        continue;
      }
      comparisons += 1;
      if (res.amount.amount !== expected) {
        mismatches.push({ kind: 'value', source: 'deep', userId, timestamp: iso, oracle: expected, service: res.amount.amount });
      }
      if ((i + 1) % 1000 === 0) logger.info(`deep: ${i + 1}/${deep.length}`);
    }
    timings.push({ source: 'deep', timestamp: `${deep.length} calls`, ms: Date.now() - t0 });
  }

  // Classify mismatches.
  const deepReasons = new Map<number, string[]>((meta.deepUsers ?? []).map((d: any) => [d.userId, d.reasons]));
  const classes = new Map<string, number>();
  mismatches.forEach((m) => {
    const u = users.get(m.userId);
    const key = [
      m.kind, m.source,
      `type=${u?.type ?? '?'}`,
      `deleted=${u?.deleted ?? '?'}`,
      `ts=${(labels.get(m.timestamp) ?? (m.source === 'deep' ? ['deep'] : ['?'])).join('+')}`,
      ...(m.source === 'deep' ? [`reasons=${(deepReasons.get(m.userId) ?? []).join('+')}`] : []),
    ].join(' ');
    classes.set(key, (classes.get(key) ?? 0) + 1);
  });

  const report = {
    oracle: opts.oracle,
    mode: opts.now ? 'now' : 'snapshots',
    cacheCleared: !!opts.cacheClear,
    comparisons,
    mismatches: mismatches.length,
    expectedMissingPointOfSale: expectedMissing,
    skippedSubMillisecond: skippedSubMs,
    usersWithMismatch: new Set(mismatches.map((m) => m.userId)).size,
    classes: [...classes.entries()].sort((a, b) => b[1] - a[1]).map(([cls, count]) => ({ cls, count })),
    firstMismatches: mismatches.slice(0, 20).map((m) => ({ ...m, diff: (m.service ?? 0) - (m.oracle ?? 0) })),
    timings,
    runtimeSeconds: (Date.now() - started) / 1000,
  };
  const file = path.join(opts.oracle, opts.now ? 'compare_now.json' : 'compare.json');
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);

  logger.info(`Comparisons: ${comparisons}, mismatches: ${mismatches.length}, `
    + `expected missing (POS): ${expectedMissing}, skipped sub-ms: ${skippedSubMs}`);
  report.classes.forEach((c) => logger.info(`  ${c.count}\t${c.cls}`));
  report.firstMismatches.forEach((m) => logger.info(
    `  user ${m.userId} @ ${m.timestamp} (${m.source}/${m.kind}): oracle=${m.oracle} service=${m.service} diff=${m.diff}`));
  logger.info(`Report written to ${file}`);
  return mismatches.length;
}

if (require.main === module) {
  program
    .description('Diff BalanceService against the balance oracle output.')
    .requiredOption('--oracle <dir>', 'oracle output directory')
    .option('--limit <n>', 'maximum number of deep getBalance calls (evenly sampled)')
    .option('--now', 'only compare getBalances() without a date against the oracle "now" snapshot')
    .option('--impl <file>', 'candidate implementation (see impl.ts)')
    .option('--cache-clear', 'DELETE FROM balance before comparing (cold cache)')
    .parse();
  const o = program.opts();
  (async () => {
    process.env.TYPEORM_SYNCHRONIZE = 'false';
    const config = Config.get();
    await Database.initialize();
    const store = ServerSettingsStore.getInstance();
    if (!store.initialized) await store.initialize();
    dinero.defaultCurrency = config.currency.code as Currency;
    dinero.defaultPrecision = config.currency.precision;
    logger.info(`Comparing against ${config.database.database} (TZ=${process.env.TZ})`);
    const failures = await compare({
      oracle: o.oracle,
      limit: o.limit ? Number(o.limit) : undefined,
      now: !!o.now,
      cacheClear: !!o.cacheClear,
      impl: o.impl,
    });
    await AppDataSource.destroy();
    process.exit(failures > 0 ? 1 : 0);
  })().catch((e) => {
    logger.error(e);
    process.exit(1);
  });
}
