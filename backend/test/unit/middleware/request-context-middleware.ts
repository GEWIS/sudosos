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

import chai from 'chai';
import express, { Application, Response } from 'express';
import RequestContextMiddleware from '../../../src/middleware/request-context-middleware';
import { getRequestContext, RequestContext } from '../../../src/helpers/request-context';

const { expect, request } = chai;

describe('RequestContextMiddleware', (): void => {
  let app: Application;
  let seen: RequestContext | undefined;

  beforeAll(() => {
    app = express();
    app.use(new RequestContextMiddleware().getMiddleware());
    app.use((req, res: Response) => {
      seen = getRequestContext();
      res.end('Success');
    });
  });

  afterEach(() => {
    seen = undefined;
  });

  describe('#handle', () => {
    it('should bind a context describing the request', async () => {
      const res = await request(app).get('/v1/invoices/4');

      expect(res.status).to.equal(200);
      expect(seen).to.exist;
      expect(seen).to.include({ method: 'GET', path: '/v1/invoices/4' });
      expect(seen!.requestId).to.be.a('string').and.not.empty;
      expect(seen!.actorId).to.be.undefined;
    });

    it('should return the request id to the caller', async () => {
      const res = await request(app).get('/');

      expect(res.headers['x-request-id']).to.equal(seen!.requestId);
    });

    it('should bind a different id to every request', async () => {
      await request(app).get('/');
      const first = seen!.requestId;
      await request(app).get('/');

      expect(seen!.requestId).to.not.equal(first);
    });
  });
});
