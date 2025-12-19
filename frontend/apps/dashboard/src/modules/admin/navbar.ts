import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@sudosos/sudosos-frontend-common';

export function useAdminNav() {
  const { t } = useI18n();

  return computed(() =>
    [
      {
        label: t('common.navigation.admin'),
        visible:
          isAllowed('update', ['all'], 'User', ['any']) ||
          isAllowed('get', ['all'], 'Banner', ['any']) ||
          isAllowed('get', ['all'], 'Transaction', ['any']),
        items: [
          {
            label: t('common.navigation.users'),
            route: '/user',
            visible: isAllowed('update', ['all'], 'User', ['any']),
          },
          {
            label: t('common.navigation.banners'),
            route: '/admin/banner',
            visible: isAllowed('get', ['own'], 'Banner', ['any']),
          },
        ].filter((item) => item.visible),
      },
      {
        label: t('common.navigation.maintainer'),
        visible: isAllowed('update', ['all'], 'Maintenance', ['*']),
        route: '/maintainer',
      },
    ].filter((item) => item.visible),
  );
}
