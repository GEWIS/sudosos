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
 * Bulk synthetic ledger generator for balance-query load testing.
 *
 * Usage: pnpm exec ts-node cli/load-gen/generate.ts --tier S|M|L|XL --seed N [--reset] [--cache]
 * Target DB comes from the TYPEORM_* env vars (see env.sh). See README.md for details.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Rng, Weighted } from './rng';
import { BulkWriter, DB_CONFIG, makeWriter, openConnection } from './bulk';
import { buildCatalogue, TIERS } from './catalogue';
import { END_US, fmtUs, SPAN_US, START_US } from './time';

const TAIL = 6; // events pinned to the very latest timestamp
const TIE_PROBABILITY = 0.035; // chance an event reuses the previous event's exact timestamp
const SELF_SALE_PROBABILITY = 0.02; // chance a transaction is a buyer == seller purchase
const NO_POS_PROBABILITY = 0.03;

function parseArgs(): { tier: string; seed: number; reset: boolean; cache: boolean } {
  const argv = process.argv.slice(2);
  const get = (name: string): string | undefined => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const tier = (get('tier') ?? '').toUpperCase();
  if (!TIERS[tier]) {
    console.error('Usage: generate.ts --tier S|M|L|XL --seed N [--reset] [--cache]');
    process.exit(1);
  }
  return {
    tier, seed: Number(get('seed') ?? 1), reset: argv.includes('--reset'), cache: argv.includes('--cache'),
  };
}

async function resetDatabase(): Promise<void> {
  const conn = await openConnection(true);
  await conn.query(`DROP DATABASE IF EXISTS \`${DB_CONFIG.database}\``);
  await conn.query(`CREATE DATABASE \`${DB_CONFIG.database}\``);
  await conn.query(`USE \`${DB_CONFIG.database}\``);
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(sql);
  await conn.end();
}

async function assertEmpty(): Promise<void> {
  const conn = await openConnection();
  const [rows] = await conn.query('SELECT (SELECT COUNT(*) FROM `user`) + (SELECT COUNT(*) FROM `transaction`) AS n');
  await conn.end();
  if (Number((rows as { n: number }[])[0].n) > 0) {
    console.error('Database is not empty. Re-run with --reset.');
    process.exit(1);
  }
}

const SUB_COUNT = new Weighted([60, 30, 10]); // 1..3 sub transactions
const ROW_COUNT = new Weighted([35, 25, 18, 11, 7, 4]); // 1..6 rows
const ROW_AMOUNT = new Weighted([50, 20, 10, 6, 4, 3, 2, 2, 2, 1]); // 1..10
const TRANSFER_KINDS = ['deposit', 'payout', 'fine', 'writeoff', 'user', 'invoice', 'sellerPayout'];
const TRANSFER_KIND_W = new Weighted([45, 10, 8, 4, 17, 8, 8]);

async function main(): Promise<void> {
  const { tier, seed, reset, cache } = parseArgs();
  const cfg = TIERS[tier];
  const started = Date.now();
  if (reset) await resetDatabase(); else await assertEmpty();
  console.log(`[loadgen] tier=${tier} seed=${seed} cache=${cache} -> ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);

  const cat = await buildCatalogue(cfg, new Rng(seed));
  console.log(`[loadgen] reference data done (${((Date.now() - started) / 1000).toFixed(1)}s)`);

  const rng = new Rng((seed ^ 0x9E3779B9) >>> 0);
  const U = cfg.users + 1;
  const nTransfers = Math.max(100, Math.round(cfg.transactions * 0.08));
  const total = cfg.transactions + nTransfers;

  // ---- Per-user activity weights (power law) --------------------------------------------
  const order = rng.shuffle([...cat.activeIds]);
  const weights = order.map((_, rank) => Math.pow(rank + 1, -1.1));
  const userSampler = new Weighted(weights);
  const sampleUser = (): number => order[userSampler.sample(rng)];
  const posByIndex: number[][] = cat.posRevisions.reduce((acc, pr, i) => {
    (acc[pr.posId - 1] ??= []).push(i);
    return acc;
  }, [] as number[][]);
  const posSampler = new Weighted(posByIndex.map((_, i) => 1 / (i + 1)));
  const allCrevs = cat.containerRevisions.map((_, i) => i);

  // Per-user deposit diligence: <1 means they never fully cover their deficit (stay negative).
  const diligence = new Float64Array(U);
  for (let u = 1; u < U; u++) diligence[u] = rng.chance(0.4) ? rng.float(0.3, 0.9) : rng.float(1.0, 1.5);

  // ---- Running state ---------------------------------------------------------------------
  const txSum = new Float64Array(U);
  const trSum = new Float64Array(U);
  const lastTx = new Int32Array(U);
  const lastTr = new Int32Array(U);
  const lastTxTs = new Float64Array(U);
  const lastTrTs = new Float64Array(U);
  // Cache snapshots: state as of the last event of each type with createdAt <= cut[u].
  const cut = new Float64Array(U).fill(Infinity);
  const sTx = new Float64Array(U);
  const sTr = new Float64Array(U);
  const sLastTx = new Int32Array(U);
  const sLastTr = new Int32Array(U);
  const sTxTs = new Float64Array(U);
  const sTrTs = new Float64Array(U);
  const cacheState = new Uint8Array(U); // 0 missing, 1 correct, 2 stale, 3 tx cursor null, 4 transfer cursor null
  if (cache) {
    const crng = new Rng((seed ^ 0xCAC4E) >>> 0);
    for (let u = 1; u < U; u++) {
      if (cat.userTypes[u] === 'POINT_OF_SALE' || crng.chance(0.4)) continue;
      const r = crng.next();
      cacheState[u] = r < 0.4 ? 1 : r < 0.75 ? 2 : r < 0.875 ? 3 : 4;
      if (cacheState[u] === 2 || (cacheState[u] > 2 && crng.chance(0.5))) {
        cut[u] = START_US + crng.next() * SPAN_US;
      }
    }
  }
  const touchTx = (u: number, delta: number, id: number, ts: number): void => {
    txSum[u] += delta;
    lastTx[u] = id;
    lastTxTs[u] = ts;
    if (ts <= cut[u]) {
      sTx[u] = txSum[u]; sLastTx[u] = id; sTxTs[u] = ts;
    }
  };
  const touchTr = (u: number, delta: number, id: number, ts: number): void => {
    trSum[u] += delta;
    lastTr[u] = id;
    lastTrTs[u] = ts;
    if (ts <= cut[u]) {
      sTr[u] = trSum[u]; sLastTr[u] = id; sTrTs[u] = ts;
    }
  };

  // ---- Writers ---------------------------------------------------------------------------
  const wTx = await makeWriter('transaction', ['createdAt', 'updatedAt', 'version', 'id', 'fromId', 'createdById',
    'pointOfSalePointOfSaleId', 'pointOfSaleRevision']);
  const wSub = await makeWriter('sub_transaction', ['createdAt', 'updatedAt', 'version', 'id', 'toId',
    'containerContainerId', 'containerRevision', 'transactionId']);
  const wRow = await makeWriter('sub_transaction_row', ['createdAt', 'updatedAt', 'version', 'id', 'amount',
    'productProductId', 'productRevision', 'invoiceId', 'subTransactionId']);
  const wTr = await makeWriter('transfer', ['createdAt', 'updatedAt', 'version', 'id', 'fromId', 'toId',
    'amountInclVat', 'description', 'vatId']);
  const writers: BulkWriter[] = [wTx, wSub, wRow, wTr];

  let txId = 0;
  let subId = 0;
  let rowId = 0;
  let trId = 0;
  let selfSales = 0;
  let zeroRows = 0;
  let zeroTransfers = 0;

  const scratchU: number[] = [];
  const scratchD: number[] = [];
  const addDelta = (u: number, d: number): void => {
    const i = scratchU.indexOf(u);
    if (i >= 0) scratchD[i] += d; else { scratchU.push(u); scratchD.push(d); }
  };

  /** Emits one transaction; returns its buyer. */
  const genTx = (ts: number, forcedBuyer: number): number => {
    const t = fmtUs(ts);
    let buyer = forcedBuyer > 0 ? forcedBuyer : sampleUser();
    let candidates = allCrevs;
    let posIdx = -1;
    if (!rng.chance(NO_POS_PROBABILITY)) {
      const pos = posByIndex[posSampler.sample(rng)];
      posIdx = rng.pick(pos);
      candidates = cat.posRevisions[posIdx].containerRevisions;
    }
    const nSub = SUB_COUNT.sample(rng) + 1;
    const chosen: number[] = [];
    for (let tries = 0; chosen.length < nSub && tries < 10; tries++) {
      const c = rng.pick(candidates);
      if (!chosen.some((x) => cat.containerRevisions[x].ownerId === cat.containerRevisions[c].ownerId)) {
        chosen.push(c);
      }
    }
    if (rng.chance(SELF_SALE_PROBABILITY)) {
      buyer = cat.containerRevisions[chosen[0]].ownerId;
      selfSales++;
    }
    const id = ++txId;
    const createdBy = rng.chance(0.85) ? buyer : rng.pick(cat.sellerIds);
    wTx.push(`(${t},${t},1,${id},${buyer},${createdBy},${posIdx >= 0 ? cat.posRevisions[posIdx].posId : 'NULL'},`
      + `${posIdx >= 0 ? cat.posRevisions[posIdx].revision : 'NULL'})`);
    scratchU.length = 0;
    scratchD.length = 0;
    addDelta(buyer, 0);
    for (const ci of chosen) {
      const cr = cat.containerRevisions[ci];
      const sid = ++subId;
      wSub.push(`(${t},${t},1,${sid},${cr.ownerId},${cr.containerId},${cr.revision},${id})`);
      const nRows = ROW_COUNT.sample(rng) + 1;
      let subTotal = 0;
      for (let k = 0; k < nRows; k++) {
        const pi = rng.int(0, cr.productIds.length - 1);
        const amount = rng.chance(0.02) ? 0 : ROW_AMOUNT.sample(rng) + 1;
        if (amount === 0) zeroRows++;
        wRow.push(`(${t},${t},1,${++rowId},${amount},${cr.productIds[pi]},${cr.productRevs[pi]},NULL,${sid})`);
        subTotal += amount * cr.prices[pi];
      }
      addDelta(buyer, -subTotal);
      addDelta(cr.ownerId, subTotal);
    }
    for (let i = 0; i < scratchU.length; i++) touchTx(scratchU[i], scratchD[i], id, ts);
    return buyer;
  };

  const roundTo = (x: number, step: number): number => Math.round(x / step) * step;
  /** Emits one transfer; returns the primary user involved. */
  const genTransfer = (ts: number, forced: number, forcedKind: string): number => {
    const t = fmtUs(ts);
    let kind = forcedKind || TRANSFER_KINDS[TRANSFER_KIND_W.sample(rng)];
    if (forced > 0 && !forcedKind && (kind === 'invoice' || kind === 'sellerPayout')) kind = 'deposit';
    let from: number | null = null;
    let to: number | null = null;
    let amount = 0;
    let desc = '';
    // Half of the transfers pick a user uniformly so the long tail also gets deposits.
    const u = forced > 0 ? forced : rng.chance(0.5) ? rng.pick(order) : sampleUser();
    const bal = txSum[u] + trSum[u];
    switch (kind) {
      case 'deposit': {
        to = u;
        const deficit = Math.max(0, -bal);
        amount = deficit > 0 ? roundTo(deficit * diligence[u] * rng.float(0.7, 1.2), 50) : rng.int(5, 50) * 100;
        // Diligent users top up with some headroom so they tend to end positive.
        if (diligence[u] >= 1) amount += rng.int(5, 80) * 100;
        if (amount <= 0) amount = 1000;
        desc = 'Deposit';
        break;
      }
      case 'payout':
        from = u;
        amount = bal > 0 ? roundTo(bal * rng.float(0.3, 1), 50) : rng.int(5, 25) * 100;
        desc = 'Payout';
        break;
      case 'fine':
        from = u;
        amount = rng.int(5, 20) * 100;
        desc = 'Fine';
        break;
      case 'writeoff':
        from = u;
        amount = rng.int(1, 50) * 100;
        desc = 'Write-off';
        break;
      case 'user': {
        const v = rng.chance(0.2) ? rng.pick(cat.sellerIds) : sampleUser();
        if (rng.chance(0.5)) { from = u; to = v; } else { from = v; to = u; }
        if (from === to) to = rng.pick(cat.sellerIds) === from ? cat.adminId : rng.pick(cat.sellerIds);
        if (from === to) to = cat.adminId;
        amount = rng.int(1, 50) * 100;
        desc = 'Transfer';
        break;
      }
      case 'invoice':
        to = u;
        amount = rng.int(10, 200) * 100;
        desc = `Invoice ${trId + 1}`;
        break;
      default: { // sellerPayout
        from = rng.pick(cat.sellerIds);
        const sb = txSum[from] + trSum[from];
        amount = sb > 0 ? roundTo(sb * rng.float(0.3, 0.9), 50) : rng.int(10, 100) * 100;
        desc = 'Seller payout';
      }
    }
    const idx = trId + 1;
    if (idx % 37 === 5 || rng.chance(0.01)) amount = 0;
    amount = Math.min(amount, 2_000_000_000);
    if (amount === 0) zeroTransfers++;
    const vat = amount > 0 && rng.chance(0.15) ? rng.pick(cat.vatGroupIds) : null;
    const id = ++trId;
    wTr.push(`(${t},${t},1,${id},${from ?? 'NULL'},${to ?? 'NULL'},${amount},'${desc}',${vat ?? 'NULL'})`);
    if (from !== null) touchTr(from, -amount, id, ts);
    if (to !== null) touchTr(to, amount, id, ts);
    return from !== null && kind !== 'user' ? from : (to ?? u);
  };

  // ---- Main streaming loop ----------------------------------------------------------------
  const bodyEvents = total - TAIL;
  let remTx = cfg.transactions - TAIL / 2;
  let remTr = nTransfers - TAIL / 2;
  const avgStep = (SPAN_US * 0.98) / total;
  let ts = START_US;
  let prevUser = 0;
  let pending: Promise<unknown> = Promise.resolve();
  const tailA = sampleUser();
  const tailB = sampleUser();
  const tailC = sampleUser();
  const CHUNK = 2000;
  let ties = 0;

  for (let i = 0; i < total; i++) {
    let isTx: boolean;
    let forced = 0;
    if (i >= bodyEvents) {
      const k = i - bodyEvents;
      ts = END_US;
      isTx = k % 2 === 0;
      forced = [tailA, tailA, tailB, tailB, tailC, tailC][k];
      ties++;
    } else {
      if (i > 0 && rng.chance(TIE_PROBABILITY)) {
        ties++;
        if (prevUser > 0 && rng.chance(0.5)) forced = prevUser;
      } else {
        ts += Math.max(1, Math.floor(avgStep * rng.float(0.2, 1.8)));
      }
      isTx = rng.next() * (remTx + remTr) < remTx;
      if (isTx) remTx--; else remTr--;
    }
    prevUser = isTx ? genTx(ts, forced) : genTransfer(ts, forced, i >= bodyEvents ? 'deposit' : '');
    if ((i + 1) % CHUNK === 0) {
      await pending;
      pending = Promise.all(writers.map((w) => w.flush()));
    }
    if ((i + 1) % 1_000_000 === 0) {
      console.log(`[loadgen] ${i + 1}/${total} events (${((Date.now() - started) / 1000).toFixed(0)}s)`);
    }
  }
  await pending;
  await Promise.all(writers.map((w) => w.flush()));
  await Promise.all(writers.map((w) => w.close()));

  // ---- Balance cache ----------------------------------------------------------------------
  let cacheRows = 0;
  if (cache) {
    const wBal = await makeWriter('balance', ['createdAt', 'updatedAt', 'version', 'userId', 'amount',
      'lastTransactionId', 'lastTransferId']);
    for (let u = 1; u < U; u++) {
      const st = cacheState[u];
      if (st === 0) continue;
      const useTx = st !== 3;
      const useTr = st !== 4;
      const amount = (useTx ? sTx[u] : 0) + (useTr ? sTr[u] : 0);
      if (Math.abs(amount) > 2_000_000_000) continue; // would overflow int(11)
      const txC = useTx && sLastTx[u] > 0 ? sLastTx[u] : null;
      const trC = useTr && sLastTr[u] > 0 ? sLastTr[u] : null;
      const at = fmtUs(Math.max(txC ? sTxTs[u] : START_US, trC ? sTrTs[u] : START_US));
      wBal.push(`(${at},${at},1,${u},${amount},${txC ?? 'NULL'},${trC ?? 'NULL'})`);
      cacheRows++;
    }
    await wBal.flush();
    await wBal.close();
  }

  let neg = 0;
  let eventless = 0;
  for (let u = 1; u < U; u++) {
    if (cat.userTypes[u] === 'POINT_OF_SALE') continue;
    if (txSum[u] + trSum[u] < 0) neg++;
    if (lastTx[u] === 0 && lastTr[u] === 0) eventless++;
  }
  const conn = await openConnection();
  for (const tbl of ['transaction', 'sub_transaction', 'sub_transaction_row', 'transfer']) {
    await conn.query(`ANALYZE TABLE \`${tbl}\``);
  }
  await conn.end();

  console.log(JSON.stringify({
    tier, seed, cache,
    users: cfg.users, transactions: txId, subTransactions: subId, subTransactionRows: rowId, transfers: trId,
    balanceCacheRows: cacheRows, tiedEvents: ties, selfSales, zeroRows, zeroTransfers,
    negativeBalanceUsers: neg, usersWithoutEvents: eventless,
    seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
