import {
  type AuditLogEntryResponse,
  AuditLogEntryResponseActionEnum,
  AuditLogEntryResponseEntityTypeEnum,
} from '@gewis/sudosos-client';
import type { RouteLocationRaw } from 'vue-router';

export type AuditAction = AuditLogEntryResponseActionEnum;
export type AuditEntityType = AuditLogEntryResponseEntityTypeEnum;

/**
 * Everything the back-end records, to offer as filters. Both lists come from the
 * generated client, so adding an action on the back-end puts it in the dropdown.
 */
export const AUDIT_ACTIONS = Object.values(AuditLogEntryResponseActionEnum);
export const AUDIT_ENTITY_TYPES = Object.values(AuditLogEntryResponseEntityTypeEnum);

/**
 * Which recorded mutations to show.
 */
export interface AuditLogFilters {
  actorId?: number;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: number;
}

/**
 * Where to send someone who clicks the object of an audit log entry. Objects
 * without a page of their own, and entries not tied to a single object, are not
 * linked.
 * @param entry - The entry to resolve a route for.
 */
export function auditEntityRoute(entry: AuditLogEntryResponse): RouteLocationRaw | undefined {
  if (!entry.entityId) return undefined;

  switch (entry.entityType) {
    case AuditLogEntryResponseEntityTypeEnum.Invoice:
      return { name: 'invoiceInfo', params: { id: entry.entityId } };
    case AuditLogEntryResponseEntityTypeEnum.FineHandoutEvent:
      return { name: 'debtorSingleHandout', params: { id: entry.entityId } };
    default:
      return undefined;
  }
}
