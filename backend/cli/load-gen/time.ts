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
 * Timestamps are handled as integer microseconds since the Unix epoch (UTC) so they fit a
 * double exactly and map 1:1 onto datetime(6).
 */

/** The latest timestamp in the ledger: 2026-10-01 00:00:00.000000 UTC. */
export const END_US = Date.UTC(2026, 9, 1) * 1000;
/** Ledger spans four years. */
export const SPAN_US = 1461 * 86400 * 1e6;
export const START_US = END_US - SPAN_US;

let lastSec = -1;
let lastPrefix = '';

/** Formats microseconds as a quoted datetime(6) literal. */
export function fmtUs(us: number): string {
  const sec = Math.floor(us / 1e6);
  if (sec !== lastSec) {
    lastSec = sec;
    lastPrefix = new Date(sec * 1000).toISOString().slice(0, 19).replace('T', ' ');
  }
  const micro = us - sec * 1e6;
  return `'${lastPrefix}.${String(micro).padStart(6, '0')}'`;
}
