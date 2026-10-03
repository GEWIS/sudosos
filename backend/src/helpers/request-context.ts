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
 * This is the module page of the request-context.
 *
 * @module internal/helpers
 */

import { AsyncLocalStorage } from 'async_hooks';

/**
 * Diagnostic information about the request that is currently being handled.
 *
 * This is deliberately limited to values that are only used for correlating log
 * lines. Anything that a request handler acts upon should be passed explicitly,
 * since code that runs outside of a request (cron tasks, workers) has no context
 * at all.
 */
export interface RequestContext {
  /**
   * Identifier that ties all log lines of a single request together.
   */
  requestId: string;

  /**
   * The HTTP method of the request.
   */
  method: string;

  /**
   * The path of the request, without its query string.
   */
  path: string;

  /**
   * The id of the user whose token was accepted for this request. Absent until
   * the token middleware has validated the token, and on endpoints that do not
   * require one.
   */
  actorId?: number;
}

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Run the given function with the given request context bound to it. The context
 * remains available in everything the function awaits or schedules.
 * @param context - the context to bind.
 * @param next - the function to run.
 */
export function runWithRequestContext(context: RequestContext, next: () => void): void {
  storage.run(context, next);
}

/**
 * @returns the context of the request that is currently being handled, or undefined
 *          when running outside of a request.
 */
export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/**
 * Record which user the current request is authenticated as. Does nothing when
 * called outside of a request.
 * @param actorId - the id of the authenticated user.
 */
export function setRequestActor(actorId: number): void {
  const context = storage.getStore();
  if (context) context.actorId = actorId;
}
