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
  getRequestContext,
  RequestContext,
  runWithRequestContext,
  setRequestActor,
} from '../../../src/helpers/request-context';

function context(requestId: string): RequestContext {
  return { requestId, method: 'GET', path: '/v1/invoices' };
}

describe('request-context', () => {
  it('should expose the bound context inside the callback', () => {
    runWithRequestContext(context('abc'), () => {
      expect(getRequestContext()).to.deep.equal(context('abc'));
    });
  });

  it('should expose no context outside of a request', () => {
    expect(getRequestContext()).to.be.undefined;
  });

  it('should keep the context available across await boundaries', async () => {
    await new Promise<void>((resolve) => {
      runWithRequestContext(context('abc'), async () => {
        await new Promise((tick) => setTimeout(tick, 1));
        expect(getRequestContext()?.requestId).to.equal('abc');
        resolve();
      });
    });
  });

  it('should keep concurrent requests isolated', async () => {
    const seen: string[] = [];
    const run = (requestId: string, delay: number) => new Promise<void>((resolve) => {
      runWithRequestContext(context(requestId), async () => {
        await new Promise((tick) => setTimeout(tick, delay));
        seen.push(getRequestContext()!.requestId);
        resolve();
      });
    });

    await Promise.all([run('first', 5), run('second', 1)]);
    expect(seen).to.deep.equal(['second', 'first']);
  });

  describe('setRequestActor', () => {
    it('should record the actor on the current context', () => {
      runWithRequestContext(context('abc'), () => {
        setRequestActor(42);
        expect(getRequestContext()?.actorId).to.equal(42);
      });
    });

    it('should do nothing outside of a request', () => {
      expect(() => setRequestActor(42)).to.not.throw();
      expect(getRequestContext()).to.be.undefined;
    });
  });
});
