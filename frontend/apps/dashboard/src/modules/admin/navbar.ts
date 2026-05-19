import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@sudosos/sudosos-frontend-common';

export function useAdminNav() {
  const { t } = useI18n();

  return computed(() => {
    const maintenanceItem = {
      label: t('common.navigation.maintainerSettings'),
      route: '/maintainer',
      visible: isAllowed('update', ['all'], 'Maintenance', ['*']),
    };
    const tasksItem = {
      label: t('common.navigation.tasks'),
      route: '/maintainer/tasks',
      visible: isAllowed('get', ['all'], 'Task', ['*']),
    };
    const maintainerItems = [maintenanceItem, tasksItem].filter((item) => item.visible);
    const onlyMaintainerItem = maintainerItems.length === 1 ? maintainerItems[0] : undefined;

    return [
      {
        label: t('common.navigation.admin'),
        visible:
          isAllowed('get', ['all'], 'User', ['any']) ||
          isAllowed('get', ['all'], 'Banner', ['any']) ||
          isAllowed('get', ['all'], 'Transaction', ['any']),
        items: [
          {
            label: t('common.navigation.users'),
            route: '/user',
            visible: isAllowed('get', ['all'], 'User', ['any']),
          },
          {
            label: t('common.navigation.banners'),
            route: '/admin/banner',
            visible: isAllowed('get', ['own'], 'Banner', ['any']),
          },
          {
            label: t('common.navigation.rbac'),
            route: '/rbac',
            visible: isAllowed('get', ['all'], 'Role', ['any']),
          },
        ].filter((item) => item.visible),
      },
      {
        label: t('common.navigation.maintainer'),
        visible: maintainerItems.length > 0,
        // When only one sub-item is visible, collapse the dropdown into a direct
        // route so the navbar stays compact for admins without Task perms.
        ...(onlyMaintainerItem ? { route: onlyMaintainerItem.route } : { items: maintainerItems }),
      },
    ].filter((item) => item.visible);
  });
}
