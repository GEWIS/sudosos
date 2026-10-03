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
 * This is the module page of the request-context-middleware.
 *
 * @module internal/middleware
 */

import { Request, RequestHandler, Response } from 'express';
import { v4 as uuid4 } from 'uuid';
import { runWithRequestContext } from '../helpers/request-context';

/**
 * This class is responsible for binding a {@link RequestContext} to every request,
 * so that log lines can be correlated per request. It should be registered before
 * any router, as requests that are rejected by other middleware are the ones that
 * benefit the most from being correlatable.
 */
export default class RequestContextMiddleware {
  /**
   * Middleware handler that binds a request context to the remainder of the request.
   * @param req - the express request to handle.
   * @param res - the express response object.
   * @param next - the express next function to continue processing of the request.
   */
  public handle(req: Request, res: Response, next: Function): void {
    const requestId = uuid4();
    res.header('X-Request-Id', requestId);

    runWithRequestContext({
      requestId,
      method: req.method,
      path: req.path,
    }, () => next());
  }

  /**
   * @returns a middleware handler to be used by express.
   */
  public getMiddleware(): RequestHandler {
    return this.handle.bind(this);
  }
}
