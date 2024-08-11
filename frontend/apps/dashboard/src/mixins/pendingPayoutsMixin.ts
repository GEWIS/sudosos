// src/mixins/pendingPayoutsMixin.ts
import { computed, type ComputedRef } from 'vue';
import { usePayoutStore } from '@/stores/payout.store';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { UserRole } from '@/utils/rbacUtils';

export function usePendingPayouts() {
  const userStore = useUserStore();
  let pendingPayouts: ComputedRef<number> | undefined;

  if (userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.BAC_PM) != -1) {
    const payoutStore = usePayoutStore();
    payoutStore.fetchPending();
    pendingPayouts = computed(() => payoutStore.pending);
  }

  return { pendingPayouts };
}
