import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import { usePendingPayouts } from '@/composables/pendingPayouts';
import { useOpenInvoiceAccounts } from '@/composables/openInvoiceAccounts';
import { useInactiveDebtors } from '@/composables/inactiveDebtors';

export function useFinancialNav() {
  const { t } = useI18n();

  const { pendingPayouts } = usePendingPayouts();
  const { openInvoiceAccounts } = useOpenInvoiceAccounts();
  const { inactiveDebtors } = useInactiveDebtors();

  // Total notification count for the main financial nav
  const notifications = computed(
    () => (pendingPayouts.value || 0) + (openInvoiceAccounts.value || 0) + (inactiveDebtors.value || 0),
  );

  return computed(() =>
    [
      {
        label: t('common.navigation.financial'),
        notifications: notifications.value,
        visible:
          isAllowed('update', ['all'], 'User', ['any']) ||
          isAllowed('get', ['all'], 'Invoice', ['any']) ||
          isAllowed('get', ['all'], 'Fine', ['any']) ||
          isAllowed('get', ['all'], 'SellerPayout', ['any']),
        items: [
          {
            label: t('common.navigation.users'),
            route: '/user',
            visible: isAllowed('update', ['all'], 'User', ['any']),
          },
          {
            label: t('common.navigation.invoices'),
            route: '/financial/invoice',
            notifications: openInvoiceAccounts.value,
            visible: isAllowed('get', ['all'], 'Invoice', ['any']),
          },
          {
            label: t('common.navigation.debtors'),
            route: '/financial/debtor',
            visible: isAllowed('get', ['all'], 'Fine', ['any']),
          },
          {
            label: t('common.navigation.payouts'),
            route: '/financial/payout',
            visible: isAllowed('get', ['all'], 'SellerPayout', ['any']),
            notifications: pendingPayouts.value,
          },
          {
            label: t('common.navigation.writeOffs'),
            route: '/financial/write-off',
            visible: isAllowed('get', ['all'], 'WriteOff', ['any']),
            notifications: inactiveDebtors.value,
          },
          {
            label: t('common.navigation.transactions'),
            route: '/financial/transaction',
            visible: isAllowed('update', ['all'], 'Transaction', ['any']),
          },
          {
            label: t('common.navigation.sellers'),
            route: '/financial/seller',
            visible: isAllowed('get', ['all'], 'User', ['any']),
          },
          {
            label: t('common.navigation.vat'),
            route: '/financial/vat',
            visible: isAllowed('get', ['all'], 'VatGroup', ['any']),
          },
          {
            label: t('common.navigation.administrativeCosts'),
            route: '/financial/administrative',
            visible: isAllowed('get', ['all'], 'InactiveAdministrativeCost', ['any']),
          },
        ].filter((item) => item.visible),
      },
    ].filter((item) => item.visible),
  );
}
