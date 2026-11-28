import type { TabResponseStatusEnum } from '@gewis/sudosos-client';

/** Tag severity per tab status, so every tab view colours a status the same way. */
export const TAB_STATUS_SEVERITY: Record<TabResponseStatusEnum, string> = {
  OPEN: 'info',
  LOCKED: 'warn',
  PAID: 'success',
  INVOICED: 'secondary',
  CANCELLED: 'contrast',
};
