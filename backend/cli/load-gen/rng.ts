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
 * Seeded PRNG helpers for the load generator. Same seed => same sequence.
 */

/** mulberry32: small, fast, good enough for synthetic data. */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Uniform float in [0, 1). */
  public next(): number {
    this.state = (this.state + 0x6D2B79F5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Uniform integer in [lo, hi] (inclusive). */
  public int(lo: number, hi: number): number {
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }

  public float(lo: number, hi: number): number {
    return lo + this.next() * (hi - lo);
  }

  public chance(p: number): boolean {
    return this.next() < p;
  }

  public pick<T>(arr: ArrayLike<T>): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** In-place Fisher-Yates shuffle. */
  public shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  /** Roughly standard normal (Box-Muller). */
  public normal(): number {
    const u = Math.max(this.next(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.next());
  }
}

/** Samples an index proportionally to the given weights (binary search over the CDF). */
export class Weighted {
  private readonly cum: Float64Array;

  constructor(weights: ArrayLike<number>) {
    this.cum = new Float64Array(weights.length);
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      this.cum[i] = acc;
    }
  }

  public sample(rng: Rng): number {
    const x = rng.next() * this.cum[this.cum.length - 1];
    let lo = 0;
    let hi = this.cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.cum[mid] > x) hi = mid; else lo = mid + 1;
    }
    return lo;
  }
}
