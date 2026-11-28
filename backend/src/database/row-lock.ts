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
 * This is the module page of the row-lock helper.
 *
 * @module internal/database
 */

import { EntityManager, FindOneOptions } from 'typeorm';

/**
 * The `lock` option that makes a `find` take a write lock on the rows it
 * reads (`SELECT ... FOR UPDATE`), so concurrent transactions that lock the
 * same rows run one after the other.
 *
 * Returns `undefined` (no lock) when the manager is not inside a transaction,
 * where a lock would not outlive the query, or on SQLite, which does not
 * support row locks but already runs one write transaction at a time.
 * @param manager - The manager the `find` runs on.
 */
export function writeLock(manager: EntityManager): FindOneOptions['lock'] | undefined {
  if (!manager.queryRunner?.isTransactionActive) return undefined;
  const { type } = manager.connection.options;
  if (type !== 'mysql' && type !== 'mariadb') return undefined;
  return { mode: 'pessimistic_write' };
}
