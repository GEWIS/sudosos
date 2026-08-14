import { computed, watch } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { UserRole } from '@/utils/rbacUtils';
import { useWriteOffStore } from '@/stores/writeoff.store';

export function useInactiveDebtors() {
  const writeOffStore = useWriteOffStore();
  const userStore = useUserStore();
  const inactiveDebtors = computed(() => {
    return writeOffStore.count;
  });

  function updateInactiveDebtors() {
    if (userStore.current.rolesWithPermissions.findIndex((r) => (r.name as UserRole) == UserRole.BAC_PM) != -1) {
      const writeOffStore = useWriteOffStore();
      void writeOffStore.fetchInactiveUsers(10, 0);
    }
  }

  watch(
    () => userStore.current.rolesWithPermissions,
    () => {
      updateInactiveDebtors();
    },
  );

  updateInactiveDebtors();
  return { inactiveDebtors };
}
