// src/mixins/pendingPayoutsMixin.ts
import { computed, type ComputedRef } from 'vue';
import { usePayoutStore } from '@/stores/payout.store';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { UserRole } from '@/utils/rbacUtils';

export function usePendingPayouts() {
  const authStore = useAuthStore();
  let pendingPayouts: ComputedRef<number> | undefined;

  if (authStore.roles.includes(UserRole.BAC)) {
    const payoutStore = usePayoutStore();
    payoutStore.fetchPending();
    pendingPayouts = computed(() => payoutStore.pending);
  }

  return { pendingPayouts };
}
