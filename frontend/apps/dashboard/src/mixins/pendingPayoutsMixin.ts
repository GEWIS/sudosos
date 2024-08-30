// src/mixins/pendingPayoutsMixin.ts
import { computed, watch } from 'vue';
import { usePayoutStore } from '@/stores/payout.store';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { UserRole } from '@/utils/rbacUtils';

export function usePendingPayouts() {
  const userStore = useUserStore();
  const payoutStore = usePayoutStore();
  const pendingPayouts = computed(() => payoutStore.pending);

  function updatePendingPayouts() {
   if (userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.BAC_PM) != -1) {
      const payoutStore = usePayoutStore();
      payoutStore.fetchPending();
    }
  }

  watch(() => userStore.current.rolesWithPermissions, () => {
    updatePendingPayouts();
  });

  updatePendingPayouts();
  return { pendingPayouts };
}
