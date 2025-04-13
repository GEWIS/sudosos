// src/mixins/pendingPayoutsMixin.ts
import { computed, watch } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { usePayoutStore } from '@/stores/payout.store';
import { UserRole } from '@/utils/rbacUtils';

export function usePendingPayouts() {
  const userStore = useUserStore();
  const payoutStore = usePayoutStore();
  const pendingPayouts = computed(() => payoutStore.pending);

  function updatePendingPayouts() {
    if (userStore.current.rolesWithPermissions.findIndex((r) => (r.name as UserRole) == UserRole.BAC_PM) != -1) {
      const payoutStore = usePayoutStore();
      void payoutStore.fetchPending();
    }
  }

  watch(
    () => userStore.current.rolesWithPermissions,
    () => {
      updatePendingPayouts();
    },
  );

  updatePendingPayouts();
  return { pendingPayouts };
}
