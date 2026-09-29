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
 * @module audit-logs
 */

import log4js, { Logger } from 'log4js';
import { FindManyOptions, FindOptionsWhereProperty } from 'typeorm';
import WithManager from '../database/with-manager';
import AuditLogEntry, { AuditAction, AuditEntityType } from '../entity/audit/audit-log-entry';
import User from '../entity/user/user';
import { AuditLogEntryResponse } from '../controller/response/audit-log-response';
import { parseUserToBaseResponse } from '../helpers/revision-to-response';
import { PaginationParameters } from '../helpers/pagination';
import { RequestWithToken } from '../middleware/token-middleware';
import { asDate, asNumber } from '../helpers/validators';
import { applyConfiguredLogLevel } from '../helpers/logging';
import QueryFilter from '../helpers/query-filter';

/**
 * A financial mutation to record.
 */
export interface AuditEvent {
  action: AuditAction;
  entityType: AuditEntityType;

  /**
   * The id of the mutated object, stored as a string so that numeric ids and
   * uuids (payment requests) fit the same column. Absent for mutations that do
   * not concern a single row.
   */
  entityId?: number | string;

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
  entityId?: string;
  fromDate?: Date;
  tillDate?: Date;
}

export function parseAuditLogFilterParameters(req: RequestWithToken): AuditLogFilterParameters {
  const { action, entityType, entityId } = req.query;
  if (action !== undefined && !Object.values(AuditAction).includes(action as AuditAction)) {
    throw new Error(`Invalid action '${action}'. Must be one of: ${Object.values(AuditAction).join(', ')}`);
  }
  if (entityType !== undefined && !Object.values(AuditEntityType).includes(entityType as AuditEntityType)) {
    throw new Error(`Invalid entityType '${entityType}'. Must be one of: ${Object.values(AuditEntityType).join(', ')}`);
  }
  if (entityId !== undefined && (typeof entityId !== 'string' || entityId.length === 0 || entityId.length > 64)) {
    throw new Error('Invalid entityId. Must be a single non-empty value of at most 64 characters.');
  }
  return {
    actorId: asNumber(req.query.actorId),
    action: action as AuditAction,
    entityType: entityType as AuditEntityType,
    entityId: entityId as string | undefined,
    fromDate: asDate(req.query.fromDate),
    tillDate: asDate(req.query.tillDate),
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
   * Callers that have no transaction to join use {@link logCommitted} instead.
   * @param actor - the user that performed the mutation.
   * @param event - the mutation to record.
   */
  public async log(actor: User, event: AuditEvent): Promise<AuditLogEntry> {
    // Append-only table: insert (not save/upsert) so an id can never update an existing row.
    const { identifiers } = await this.manager.insert(AuditLogEntry, {
      actor,
      actorName: AuditService.nameOf(actor),
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId !== undefined ? String(event.entityId) : null,
      changes: event.changes ?? null,
    });
    const entry = await this.manager.findOneOrFail(AuditLogEntry, {
      where: { id: identifiers[0].id },
    });

    this.logger.audit(event.action, {
      entityType: event.entityType,
      entityId: event.entityId,
      actorName: entry.actorName,
      auditLogEntryId: entry.id,
    });

    return entry;
  }

  /**
   * Record a financial mutation that has already committed, without letting a
   * failed insert reach the caller.
   *
   * Meant for mutations that cannot share a transaction with their entry: the
   * static Active-Record services (PayoutRequestService, ProductService,
   * VoucherGroupService), and handing out fines, which commits and emails the
   * fined users on its own. Turning a failed insert into an error there would
   * answer 500 for a change that did happen and invite a retry that repeats it,
   * so the failure is logged at error level and the caller carries on.
   * @param actor - the user that performed the mutation.
   * @param event - the mutation to record.
   * @returns the entry, or undefined when it could not be recorded.
   */
  public async logCommitted(actor: User, event: AuditEvent): Promise<AuditLogEntry | undefined> {
    try {
      return await this.log(actor, event);
    } catch (error) {
      this.logger.error(
        `${event.action} on ${event.entityType} ${event.entityId ?? '(no id)'} committed, but its audit entry failed to record:`,
        error,
      );
      return undefined;
    }
  }

  private static getOptions(filters: AuditLogFilterParameters): FindManyOptions<AuditLogEntry> {
    return {
      where: {
        actor: { id: filters.actorId },
        action: filters.action,
        entityType: filters.entityType,
        entityId: filters.entityId,
        createdAt: QueryFilter.createFilterWhereDate(filters.fromDate, filters.tillDate) as FindOptionsWhereProperty<Date>,
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
