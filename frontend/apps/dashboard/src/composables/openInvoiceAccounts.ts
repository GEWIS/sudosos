import { computed, watch } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { UserRole } from '@/utils/rbacUtils';
import { useInvoiceStore } from '@/stores/invoice.store';

export function useOpenInvoiceAccounts() {
  const invoiceStore = useInvoiceStore();
  const userStore = useUserStore();
  const openInvoiceAccounts = computed(() => {
    return Object.values(invoiceStore.negativeInvoiceUsers).length;
  });

  function updateOpenInvoiceAccounts() {
    if (userStore.current.rolesWithPermissions.findIndex((r) => (r.name as UserRole) == UserRole.BAC_PM) != -1) {
      const invoiceStore = useInvoiceStore();
      void invoiceStore.fetchAllNegativeInvoiceUsers();
    }
  }

  watch(
    () => userStore.current.rolesWithPermissions,
    () => {
      updateOpenInvoiceAccounts();
    },
  );

  updateOpenInvoiceAccounts();
  return { openInvoiceAccounts };
}
