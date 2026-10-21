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
import {
  ceilMs, chooseTimestamps, formatTimestamp, InMemoryLedger, justBefore, Micros, MS, parseTimestamp, replay,
  ReplayResult,
} from '../../../cli/load-gen/oracle';

const BASE = parseTimestamp('2026-01-01 00:00:00.000000');
const at = (ms: number): Micros => BASE + Math.round(ms * MS);

// Users: 1 = buyer A, 2 = seller B, 3 = C (buys from itself), 4 = D (transfers only), 5 = E (no events).
function fixture(): InMemoryLedger {
  return {
    prices: [
      { productId: 1, revision: 1, priceInclVat: 100 },
      { productId: 1, revision: 2, priceInclVat: 150 },
      { productId: 2, revision: 1, priceInclVat: 250 },
      { productId: 3, revision: 1, priceInclVat: 0 },
    ],
    transactions: [
      // Inserted out of chronological order on purpose: id 3 is the earliest.
      { id: 1, fromId: 1, createdAt: at(10) },
      { id: 2, fromId: 1, createdAt: at(20) },
      { id: 3, fromId: 3, createdAt: at(5) },
    ],
    subTransactions: [
      { id: 1, transactionId: 1, toId: 2 },
      { id: 2, transactionId: 1, toId: 3 },
      { id: 3, transactionId: 3, toId: 3 },
      { id: 4, transactionId: 3, toId: 2 },
      { id: 5, transactionId: 2, toId: 2 },
      { id: 6, transactionId: 2, toId: 2 },
    ],
    rows: [
      { subTransactionId: 1, amount: 2, productId: 1, revision: 1 }, // 200
      { subTransactionId: 1, amount: 1, productId: 2, revision: 1 }, // 250
      { subTransactionId: 2, amount: 1, productId: 1, revision: 2 }, // 150 (revision 2 price)
      { subTransactionId: 3, amount: 4, productId: 1, revision: 1 }, // 400, buyer == seller
      { subTransactionId: 4, amount: 1, productId: 2, revision: 1 }, // 250
      { subTransactionId: 5, amount: 0, productId: 2, revision: 1 }, // zero amount
      { subTransactionId: 6, amount: 3, productId: 3, revision: 1 }, // zero price
    ],
    transfers: [
      { id: 1, fromId: null, toId: 1, amountInclVat: 1000, createdAt: at(10) }, // ties with transaction 1
      { id: 2, fromId: 4, toId: null, amountInclVat: 300, createdAt: at(30) },
      { id: 3, fromId: 1, toId: 4, amountInclVat: 50, createdAt: at(30) }, // ties with transfer 2
      { id: 4, fromId: null, toId: null, amountInclVat: 999, createdAt: at(40) }, // no party at all
      { id: 5, fromId: null, toId: 2, amountInclVat: 7, createdAt: at(50.5) }, // sub-millisecond
    ],
  };
}

function bal(result: ReplayResult, ts: Micros, user: number): number {
  const snap = result.snapshots.get(ts);
  if (!snap) throw new Error(`no snapshot at ${formatTimestamp(ts)}`);
  return snap.get(user) ?? 0;
}

function balances(result: ReplayResult, ts: Micros): number[] {
  return [1, 2, 3, 4, 5].map((u) => bal(result, ts, u));
}

function deepOf(result: ReplayResult, user: number): [number, number][] {
  return result.deep.filter((d) => d.userId === user).map((d) => [(d.timestamp - BASE) / MS, d.balance]);
}

describe('balance oracle', () => {
  describe('timestamps', () => {
    it('should round-trip microsecond timestamps', () => {
      const s = '2026-03-04 05:06:07.123456';
      const us = parseTimestamp(s);
      expect(formatTimestamp(us)).to.equal('2026-03-04T05:06:07.123456Z');
      expect(parseTimestamp(formatTimestamp(us))).to.equal(us);
      expect(parseTimestamp('2026-03-04 05:06:07')).to.equal(parseTimestamp('2026-03-04T05:06:07.000000Z'));
    });

    it('should align to milliseconds', () => {
      expect(ceilMs(at(1))).to.equal(at(1));
      expect(ceilMs(at(1) + 1)).to.equal(at(2));
      expect(justBefore(at(1))).to.equal(at(0));
      expect(justBefore(at(1) + 1)).to.equal(at(1));
    });
  });

  describe('replay', () => {
    const probes = [4, 5, 9, 10, 20, 29, 30, 40, 50, 51].map(at);

    it('should compute hand-checked balances at every snapshot', async () => {
      const r = await replay(fixture(), probes);
      //                                       A     B     C    D   E
      expect(balances(r, at(4))).to.deep.equal([0, 0, 0, 0, 0]);
      expect(balances(r, at(5))).to.deep.equal([0, 250, -250, 0, 0]);
      expect(balances(r, at(9))).to.deep.equal([0, 250, -250, 0, 0]);
      expect(balances(r, at(10))).to.deep.equal([400, 700, -100, 0, 0]);
      expect(balances(r, at(20))).to.deep.equal([400, 700, -100, 0, 0]);
      expect(balances(r, at(29))).to.deep.equal([400, 700, -100, 0, 0]);
      expect(balances(r, at(30))).to.deep.equal([350, 700, -100, -250, 0]);
      expect(balances(r, at(40))).to.deep.equal([350, 700, -100, -250, 0]);
      expect(balances(r, at(50))).to.deep.equal([350, 700, -100, -250, 0]);
      expect(balances(r, at(51))).to.deep.equal([350, 707, -100, -250, 0]);
    });

    it('should net buyer == seller to the cost of what was bought from others', async () => {
      const r = await replay(fixture(), probes);
      // C buys 400 from itself and 250 from B: net -250; later earns 150 as seller.
      expect(bal(r, at(5), 3)).to.equal(-250);
      expect(bal(r, at(10), 3)).to.equal(-100);
    });

    it('should credit sellers at the parent transaction time, not by id order', async () => {
      const r = await replay(fixture(), probes);
      // Transaction 3 (earliest) credits B before transaction 1 does.
      expect(bal(r, at(5), 2)).to.equal(250);
      expect(bal(r, at(9), 2)).to.equal(250);
      expect(bal(r, at(10), 2)).to.equal(700);
    });

    it('should include every event sharing the snapshot timestamp', async () => {
      const r = await replay(fixture(), probes);
      expect(bal(r, at(10), 1)).to.equal(400); // transaction 1 and transfer 1
      expect(bal(r, at(30), 4)).to.equal(-250); // transfers 2 and 3
      expect(bal(r, at(30), 1)).to.equal(350);
    });

    it('should treat NULL transfer sides as no party', async () => {
      const r = await replay(fixture(), probes);
      const sum = (ts: Micros) => [...r.snapshots.get(ts).values()].reduce((a, b) => a + b, 0);
      expect(sum(at(30))).to.equal(1000 - 300);
      expect(sum(at(40))).to.equal(1000 - 300);
      expect(r.final.size).to.equal(4);
    });

    it('should keep zero-amount and zero-price rows at zero', async () => {
      const r = await replay(fixture(), probes);
      expect(bal(r, at(20), 1)).to.equal(bal(r, at(10), 1));
      expect(bal(r, at(20), 2)).to.equal(bal(r, at(10), 2));
    });

    it('should apply sub-millisecond events only after their instant', async () => {
      const r = await replay(fixture(), probes);
      expect(bal(r, at(50), 2)).to.equal(700);
      expect(bal(r, at(51), 2)).to.equal(707);
    });

    it('should give users without events balance 0 everywhere', async () => {
      const r = await replay(fixture(), probes);
      probes.forEach((p) => expect(bal(r, p, 5)).to.equal(0));
      expect(r.final.has(5)).to.equal(false);
    });

    it('should not depend on input order', async () => {
      const f = fixture();
      const shuffled: InMemoryLedger = {
        ...f,
        transactions: [...f.transactions].reverse(),
        subTransactions: [...f.subTransactions].reverse(),
        rows: [...f.rows].reverse(),
        transfers: [...f.transfers].reverse(),
      };
      const a = await replay(f, probes);
      const b = await replay(shuffled, probes);
      expect([...b.final.entries()].sort()).to.deep.equal([...a.final.entries()].sort());
      probes.forEach((p) => expect(balances(b, p)).to.deep.equal(balances(a, p)));
    });
  });

  describe('deep snapshots', () => {
    it('should snapshot just before and after every event of a deep user', async () => {
      const r = await replay(fixture(), [], [1, 2, 3, 5], [at(4), at(51)]);
      expect(deepOf(r, 1)).to.deep.equal([[9, 0], [10, 400], [19, 400], [20, 400], [29, 400], [30, 350]]);
      expect(deepOf(r, 2)).to.deep.equal([[4, 0], [5, 250], [9, 250], [10, 700], [19, 700], [20, 700],
        [50, 700], [51, 707]]);
      expect(deepOf(r, 3)).to.deep.equal([[4, 0], [5, -250], [9, -250], [10, -100]]);
      expect(deepOf(r, 5)).to.deep.equal([[4, 0], [51, 0]]);
    });

    it('should skip the just-before snapshot when it is no longer observable', async () => {
      const ledger: InMemoryLedger = {
        prices: [], transactions: [], subTransactions: [], rows: [],
        transfers: [
          { id: 1, fromId: null, toId: 1, amountInclVat: 10, createdAt: at(1.2) },
          { id: 2, fromId: null, toId: 1, amountInclVat: 5, createdAt: at(1.7) },
        ],
      };
      const r = await replay(ledger, [at(1), at(2)], [1]);
      expect(deepOf(r, 1)).to.deep.equal([[1, 0], [2, 15]]);
      expect(bal(r, at(1), 1)).to.equal(0);
      expect(bal(r, at(2), 1)).to.equal(15);
    });
  });

  describe('safety', () => {
    it('should fail on a missing product revision', async () => {
      const f = fixture();
      f.rows.push({ subTransactionId: 1, amount: 1, productId: 9, revision: 9 });
      await expect(replay(f, [])).to.be.rejectedWith('No product_revision (9, 9)');
    });

    it('should fail instead of losing precision', async () => {
      const f = fixture();
      f.prices.push({ productId: 9, revision: 1, priceInclVat: 2 ** 31 - 1 });
      f.rows.push({ subTransactionId: 1, amount: 2 ** 31 - 1, productId: 9, revision: 1 });
      f.rows.push({ subTransactionId: 1, amount: 2 ** 31 - 1, productId: 9, revision: 1 });
      f.rows.push({ subTransactionId: 1, amount: 2 ** 31 - 1, productId: 9, revision: 1 });
      await expect(replay(f, [])).to.be.rejectedWith('Unsafe integer');
    });
  });

  describe('chooseTimestamps', () => {
    it('should pick before-all, min, now, ties and midpoints deterministically', () => {
      const sorted = Float64Array.from([at(1), at(5), at(5), at(9), at(20.5), at(100)]);
      const a = chooseTimestamps(sorted, 20, 1);
      const b = chooseTimestamps(sorted, 20, 1);
      expect(a).to.deep.equal(b);
      const labelled = (l: string) => a.filter((c) => c.labels.includes(l)).map((c) => (c.timestamp - BASE) / MS);
      expect(labelled('before-all')).to.deep.equal([0]);
      expect(labelled('min')).to.deep.equal([1]);
      expect(labelled('now')).to.deep.equal([100]);
      expect(labelled('tie')).to.deep.equal([5]);
      expect(labelled('just-before-tie')).to.deep.equal([4]);
      expect(labelled('midpoint').length).to.equal(4);
      a.forEach((c) => expect(c.timestamp % MS).to.equal(0));
      for (let i = 1; i < a.length; i += 1) expect(a[i].timestamp).to.be.greaterThan(a[i - 1].timestamp);
    });
  });
});
