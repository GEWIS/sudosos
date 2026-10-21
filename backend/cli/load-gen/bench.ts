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
 * Time the BalanceService read paths against the loaded load-test DB.
 * Usage: ts-node cli/load-gen/bench.ts --label baseline-M [--timeout 600] [--out file.json]
 * Each scenario is killed server-side after --timeout seconds and recorded as a timeout.
 */
import 'reflect-metadata';
import fs from 'fs';
import { program } from 'commander';
import dinero, { Currency } from 'dinero.js';
import Database, { AppDataSource } from '../../src/database/database';
import Config from '../../src/config';
import ServerSettingsStore from '../../src/server-settings/server-settings-store';
import { loadCandidate } from './impl';

interface Result { scenario: string; ms: number | null; note?: string; rows?: number }

async function main() {
  program
    .requiredOption('--label <label>')
    .option('--timeout <seconds>', 'per-scenario server-side timeout', '600')
    .option('--impl <file>', 'candidate implementation (see impl.ts)')
    .option('--out <file>')
    .parse();
  const opts = program.opts();
  const timeout = Number(opts.timeout);

  const config = Config.get();
  await Database.initialize();
  const store = ServerSettingsStore.getInstance();
  if (!store.initialized) await store.initialize();
  dinero.defaultCurrency = config.currency.code as Currency;
  dinero.defaultPrecision = config.currency.precision;

  const q = (sql: string) => AppDataSource.query(sql);
  await q(`SET GLOBAL max_statement_time = ${timeout}`);
  const { service, prepare } = await loadCandidate(opts.impl);
  let prepareMs: number | null = null;
  if (prepare) {
    const t0 = process.hrtime.bigint();
    await prepare(AppDataSource);
    prepareMs = Number(process.hrtime.bigint() - t0) / 1e6;
  }

  const [heavy] = await q('select fromId as id, count(*) c from `transaction` group by fromId order by c desc limit 1');
  const buyers = await q('select fromId as id, count(*) c from `transaction` group by fromId order by c');
  const median = buyers[Math.floor(buyers.length / 2)];
  const [range] = await q('select min(createdAt) as lo, max(createdAt) as hi from `transaction`');
  const midDate = new Date((new Date(range.lo).getTime() + new Date(range.hi).getTime()) / 2);
  const counts = await q('select (select count(*) from `transaction`) tx, (select count(*) from sub_transaction_row) str, (select count(*) from transfer) tf, (select count(*) from user) users');

  const results: Result[] = [];
  const run = async (scenario: string, fn: () => Promise<any>) => {
    const start = process.hrtime.bigint();
    try {
      const out = await fn();
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      results.push({ scenario, ms, rows: Array.isArray(out) ? out[0]?.length : undefined });
    } catch (e: any) {
      const timedOut = /max_statement_time|Query execution was interrupted/i.test(String(e?.message));
      results.push({ scenario, ms: null, note: timedOut ? `timeout>${timeout}s` : String(e?.message).slice(0, 200) });
    }
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(results[results.length - 1]));
  };

  await q('delete from balance');
  await run('cold: getBalance heavy user', () => service.getBalance(heavy.id));
  await run('cold: getBalance median user', () => service.getBalance(median.id));
  await run('cold: getBalance heavy user @mid', () => service.getBalance(heavy.id, midDate));
  await run('cold: getBalances all, now', () => service.getBalances({}));
  await run('cold: calculateTotalBalances now', () => service.calculateTotalBalances(new Date()));
  await run('updateBalances all', () => service.updateBalances({}));
  await run('warm: getBalance heavy user', () => service.getBalance(heavy.id));
  await run('warm: getBalances all, now', () => service.getBalances({}));
  await run('warm: getBalances all @mid', () => service.getBalances({ date: midDate }));
  await run('warm: calculateTotalBalances now', () => service.calculateTotalBalances(new Date()));
  await q('delete from balance');
  await q('SET GLOBAL max_statement_time = 0');

  const report = { label: opts.label, prepareMs, at: new Date().toISOString(), counts: counts[0], results };
  if (opts.out) fs.writeFileSync(opts.out, JSON.stringify(report, null, 2));
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(report, null, 2));
  await AppDataSource.destroy();
}

main().catch((e) => { console.error(e); process.exit(1); });
