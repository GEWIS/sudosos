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
 * Multi-row INSERT writer. One connection per table so tables load concurrently.
 * All values must already be SQL literals (numbers, NULL, or quoted ASCII strings).
 */

import { Connection, createConnection } from 'mysql2/promise';

export const DB_CONFIG = {
  host: process.env.TYPEORM_HOST ?? '127.0.0.1',
  port: Number(process.env.TYPEORM_PORT ?? 3307),
  user: process.env.TYPEORM_USERNAME ?? 'root',
  password: process.env.TYPEORM_PASSWORD ?? 'root',
  database: process.env.TYPEORM_DATABASE ?? 'balance_lt',
};

export async function openConnection(multipleStatements = false): Promise<Connection> {
  const conn = await createConnection({ ...DB_CONFIG, multipleStatements });
  await conn.query('SET FOREIGN_KEY_CHECKS=0, UNIQUE_CHECKS=0');
  return conn;
}

export class BulkWriter {
  private buf: string[] = [];

  public rowsWritten = 0;

  constructor(
    private readonly conn: Connection,
    private readonly table: string,
    private readonly columns: string[],
  ) {}

  /** @param row SQL tuple text, e.g. `(1,2,NULL)` */
  public push(row: string): void {
    this.buf.push(row);
  }

  public get pending(): number {
    return this.buf.length;
  }

  /** Snapshots and clears the buffer synchronously, then resolves when the INSERT is done. */
  public async flush(): Promise<void> {
    if (this.buf.length === 0) return;
    const rows = this.buf;
    this.buf = [];
    this.rowsWritten += rows.length;
    const cols = this.columns.map((c) => `\`${c}\``).join(',');
    // Cap statement size at ~10k rows.
    for (let i = 0; i < rows.length; i += 10000) {
      const part = rows.length <= 10000 ? rows : rows.slice(i, i + 10000);
      await this.conn.query(`INSERT INTO \`${this.table}\` (${cols}) VALUES ${part.join(',')}`);
    }
  }

  public async close(): Promise<void> {
    await this.conn.end();
  }
}

export async function makeWriter(table: string, columns: string[]): Promise<BulkWriter> {
  return new BulkWriter(await openConnection(), table, columns);
}
