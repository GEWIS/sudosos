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
 * This is the module page of the audit-service.
 *
 * @module audit
 */

import log4js, { Logger } from 'log4js';
import { FindManyOptions } from 'typeorm';
import WithManager from '../database/with-manager';
import AuditLogEntry, { AuditAction, AuditEntityType } from '../entity/audit/audit-log-entry';
import User from '../entity/user/user';
import { AuditLogEntryResponse } from '../controller/response/audit-log-response';
import { parseUserToBaseResponse } from '../helpers/revision-to-response';
import { PaginationParameters } from '../helpers/pagination';
import { RequestWithToken } from '../middleware/token-middleware';
import { asNumber } from '../helpers/validators';
import { applyConfiguredLogLevel } from '../helpers/logging';

/**
 * A financial mutation to record.
 */
export interface AuditEvent {
  action: AuditAction;
  entityType: AuditEntityType;

  /**
   * The id of the mutated object. Absent for mutations that do not concern a
   * single row, such as handing out fines to everyone in debt.
   */
  entityId?: number;

  /**
   * The fields that changed, keyed by field name. Only worth filling in where the
   * old and new value are already at hand.
   */
  changes?: Record<string, unknown>;
}

export interface AuditLogFilterParameters {
  actorId?: number;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: number;
}

export function parseAuditLogFilterParameters(req: RequestWithToken): AuditLogFilterParameters {
  return {
    actorId: asNumber(req.query.actorId),
    action: req.query.action as AuditAction,
    entityType: req.query.entityType as AuditEntityType,
    entityId: asNumber(req.query.entityId),
  };
}

/**
 * Records and reads the audit log of financial mutations.
 *
 * Entries are append-only. There is deliberately no way to update or delete one,
 * and no retention job that expires them: bookkeeping needs the trail to stay
 * complete.
 */
export default class AuditService extends WithManager {
  private logger: Logger = log4js.getLogger('Audit');

  public constructor(...args: ConstructorParameters<typeof WithManager>) {
    super(...args);
    applyConfiguredLogLevel(this.logger);
  }

  public static asAuditLogEntryResponse(entry: AuditLogEntry): AuditLogEntryResponse {
    return {
      id: entry.id,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      version: entry.version,
      actor: entry.actor ? parseUserToBaseResponse(entry.actor, false) : undefined,
      actorName: entry.actorName,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? undefined,
      changes: entry.changes ?? undefined,
    };
  }

  private static nameOf(actor: User): string {
    return `${actor.firstName} ${actor.lastName}`.trim();
  }

  /**
   * Record a financial mutation.
   *
   * When the caller already runs the mutation in a transaction, construct this
   * service with that transaction's manager: the entry then commits with the
   * mutation, and a rolled back mutation leaves no entry claiming it happened.
   * Callers that have no transaction to join record the entry directly after the
   * mutation succeeded instead.
   * @param actor - the user that performed the mutation.
   * @param event - the mutation to record.
   */
  public async log(actor: User, event: AuditEvent): Promise<AuditLogEntry> {
    const entry = await this.manager.save(AuditLogEntry, {
      actor,
      actorName: AuditService.nameOf(actor),
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId ?? null,
      changes: event.changes ?? null,
    });

    this.logger.audit(event.action, {
      entityType: event.entityType,
      entityId: event.entityId,
      actorName: entry.actorName,
      auditLogEntryId: entry.id,
    });

    return entry;
  }

  private static getOptions(filters: AuditLogFilterParameters): FindManyOptions<AuditLogEntry> {
    return {
      where: {
        actor: { id: filters.actorId },
        action: filters.action,
        entityType: filters.entityType,
        entityId: filters.entityId,
      },
      order: { createdAt: 'DESC', id: 'DESC' },
    };
  }

  /**
   * Get the recorded mutations, newest first.
   * @param filters - the filters to apply.
   * @param pagination - the pagination to apply.
   */
  public async getAuditLogEntries(
    filters: AuditLogFilterParameters = {},
    pagination: PaginationParameters = {},
  ): Promise<[AuditLogEntry[], number]> {
    const { take, skip } = pagination;
    return this.manager.findAndCount(AuditLogEntry, {
      ...AuditService.getOptions(filters),
      take,
      skip,
    });
  }
}
