import { computed, onMounted, ref } from 'vue';
import { useAuthStore, isAllowed } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import apiService from '@/services/ApiService';

type OrganNotificationMap = Record<number, string>;

export function useSellerNav() {
  const { t } = useI18n();
  const authStore = useAuthStore();

  // Reactive notification mapping
  const organNotifications = ref<OrganNotificationMap>({});

  // Fetch balances in the background, only update notifications
  async function fetchOrgansNotifications() {
    const notifications: OrganNotificationMap = {};
    await Promise.all(
      authStore.organs.map(async (organ) => {
        const res = await apiService.balance.getBalanceId(organ.id);
        notifications[organ.id] = res.data.amount.amount > 0 ? ' ' : '';
      }),
    );
    organNotifications.value = notifications;
  }

  // Start loading in the background after mount
  onMounted(fetchOrgansNotifications);

  const canGetProducts = isAllowed('get', ['own', 'organ'], 'Product', ['any']);
  const canGetPointsOfSale = isAllowed('get', ['own', 'organ'], 'PointOfSale', ['any']);

  return computed(() => [
    {
      label: t('common.navigation.seller'),
      visible: canGetProducts || canGetPointsOfSale,
      items: [
        {
          label: t('common.navigation.productsContainers'),
          route: '/product',
          visible: canGetProducts,
        },
        {
          label: t('common.navigation.pos'),
          route: '/point-of-sale',
          visible: canGetPointsOfSale,
        },
        ...authStore.organs.map((organ) => ({
          label: `${organ.firstName} ${organ.lastName}`,
          route: '/user/' + organ.id,
          notifications: organNotifications.value[organ.id] || undefined,
          visible: true,
        })),
      ].filter((item: { visible: boolean }) => item.visible),
    },
  ]);
}
