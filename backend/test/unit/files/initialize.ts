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
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import initializeDiskStorage from '../../../src/files/initialize';
import * as locations from '../../../src/files/storage/locations';

describe('initializeDiskStorage', () => {
  // The whole point of this function is to create directories relative to
  // process.cwd() -- the same base DiskStorage resolves its own relative
  // locations against. Stubbing fs is not an option for a native `import *
  // as fs` namespace import, so this exercises the real filesystem inside a
  // throwaway temp dir instead, which also happens to prove the fix for
  // real rather than just asserting on mocked call arguments.
  let originalCwd: string;
  let tmpDir: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sudosos-initialize-test-'));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates every storage location relative to cwd, matching how DiskStorage resolves the same paths', () => {
    initializeDiskStorage();

    const allLocations = Object.values(locations);
    expect(allLocations.length).to.be.greaterThan(0);

    allLocations.forEach((location) => {
      const expected = path.resolve(location);
      expect(fs.existsSync(expected), `expected ${expected} to have been created`).to.be.true;
      expect(fs.statSync(expected).isDirectory()).to.be.true;
    });
  });

  it('does not error when a location already exists', () => {
    initializeDiskStorage();
    // Calling it again against directories that already exist must be a no-op, not a throw.
    expect(() => initializeDiskStorage()).to.not.throw();
  });
});
