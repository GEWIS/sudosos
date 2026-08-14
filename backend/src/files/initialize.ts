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
 * This is the module page of the initialize-disk-storage.
 *
 * @module internal/files
 */

import * as fs from 'fs';
import path from 'path';
import * as locations from './storage/locations';

/**
 * Create all folders necessary to store files locally on disk.
 *
 * Resolves each location the same way `DiskStorage` does when it actually
 * reads/writes a file: relative to `process.cwd()`, not to this module's own
 * `__dirname`. Those two used to coincide under ts-node (where `__dirname` is
 * two levels above `src/`, i.e. the backend package root, matching cwd), but
 * diverge once compiled: `__dirname` for the built `out/src/files/initialize.js`
 * is two levels above `out/`, i.e. `<app>/out`, one directory short of the
 * `<app>` cwd the process actually runs with. That mismatch silently created an
 * unused `out/data/...` directory tree while every real read/write happened
 * under cwd-relative `data/...` instead.
 */
export default function initializeDiskStorage() {
  Object.values(locations).forEach((location) => {
    const resolved = path.resolve(location);
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true });
    }
  });
}
