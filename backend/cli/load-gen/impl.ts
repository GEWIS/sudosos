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
 * Candidate-implementation plug-in for bench.ts / compare.ts.
 *
 * A candidate file default-exports a class that extends BalanceService (same public API) and may
 * export `prepare(dataSource)`: DDL / index / backfill work needed by the candidate. prepare is
 * idempotent and timed separately by the callers.
 */
import path from 'path';
import { DataSource } from 'typeorm';
import BalanceService from '../../src/service/balance-service';

export interface Candidate {
  service: BalanceService;
  prepare?: (dataSource: DataSource) => Promise<void>;
}

export async function loadCandidate(implPath?: string): Promise<Candidate> {
  if (!implPath) return { service: new BalanceService() };
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const mod = require(path.resolve(implPath));
  const Impl = mod.default ?? mod;
  return { service: new Impl(), prepare: mod.prepare };
}
