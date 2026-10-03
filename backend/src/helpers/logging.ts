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
 * This is the module page of logging.
 *
 * @module internal/helpers
 */

import log4js, { LoggingEvent } from 'log4js';
import Config from '../config';
import { getRequestContext } from './request-context';

/**
 * The shape of a single line of JSON log output.
 *
 * Log calls are expected to pass a constant message first and their variable parts
 * in an object after it, for example
 * `logger.trace('invoice.delete', { invoiceId: 4 })`. A constant message can be
 * grouped and counted, whereas a message with values interpolated into it cannot.
 */
export interface StructuredLogEvent {
  timestamp: string;
  level: string;
  category: string;
  msg: string;
  requestId?: string;
  actorId?: number;
  method?: string;
  path?: string;
  /**
   * Anything that was logged next to the message. Objects are merged into this
   * record; other values are collected under `args`.
   */
  [field: string]: unknown;
}

function serializeError(error: Error): Record<string, unknown> {
  return { name: error.name, message: error.message, stack: error.stack };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Split the arguments of a log call into its message and its fields. The first
 * string that was logged becomes the message, plain objects are merged into the
 * fields, and everything else ends up under `args`. Both `log('msg', { field })`
 * and `log({ field }, 'msg')` are therefore understood.
 * @param data - the arguments that were passed to the log call.
 */
export function flattenLogData(data: unknown[]): { msg: string, fields: Record<string, unknown> } {
  const messageIndex = data.findIndex((value) => typeof value === 'string');

  const fields: Record<string, unknown> = {};
  const args: unknown[] = [];
  data.forEach((value, index) => {
    if (index === messageIndex) return;
    if (value instanceof Error) {
      fields.error = serializeError(value);
    } else if (isPlainObject(value)) {
      Object.assign(fields, value);
    } else {
      args.push(value);
    }
  });
  if (args.length > 0) fields.args = args;

  return { msg: messageIndex === -1 ? '' : data[messageIndex] as string, fields };
}

/**
 * Flatten a log4js event into a single record, annotated with the context of the
 * request that produced it.
 * @param event - the log4js event to flatten.
 */
export function toStructuredLogEvent(event: LoggingEvent): StructuredLogEvent {
  const { msg, fields } = flattenLogData(event.data);
  const context = getRequestContext();

  return {
    timestamp: event.startTime.toISOString(),
    level: event.level.levelStr,
    category: event.categoryName,
    msg,
    ...(context ? {
      requestId: context.requestId,
      actorId: context.actorId,
      method: context.method,
      path: context.path,
    } : {}),
    ...fields,
  };
}

/**
 * Render a log4js event as a single human-readable line, keeping the request id
 * so that the pretty format stays correlatable as well.
 * @param event - the log4js event to render.
 */
export function toPrettyLogLine(event: LoggingEvent): string {
  const { msg, fields } = flattenLogData(event.data);
  const context = getRequestContext();

  const prefix = context ? `[${context.requestId.substring(0, 8)}] ` : '';
  const rest = Object.keys(fields).length > 0 ? ` ${JSON.stringify(fields)}` : '';
  return `[${event.startTime.toISOString()}] [${event.level.levelStr}] ${event.categoryName} - ${prefix}${msg}${rest}`;
}

let configured = false;

/**
 * Register the log4js layouts used by this application. Safe to call more than once.
 */
function configureLog4js(): void {
  if (configured) return;

  log4js.addLayout('json', () => (event: LoggingEvent) => JSON.stringify(toStructuredLogEvent(event)));
  log4js.addLayout('pretty', () => (event: LoggingEvent) => toPrettyLogLine(event));

  configured = true;
}

export function getConfiguredLogLevel(): string {
  return Config.get().app.logLevel;
}

export function applyConfiguredLogLevel(logger: log4js.Logger): void {
  logger.level = getConfiguredLogLevel();
}

export default function getAppLogger(category: string = 'Application'): log4js.Logger {
  configureLog4js();
  log4js.configure({
    appenders: {
      out: { type: 'stdout', layout: { type: Config.get().app.logFormat } },
    },
    disableClustering: true,
    categories: { default: { appenders: ['out'], level: 'all' } },
  });
  const logger = log4js.getLogger(category);
  applyConfiguredLogLevel(logger);
  return logger;
}
