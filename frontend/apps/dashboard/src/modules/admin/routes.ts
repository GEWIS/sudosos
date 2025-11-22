import type { RouteRecordRaw } from 'vue-router';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import DashboardLayout from '@/layout/DashboardLayout.vue';
import AdminUserOverView from '@/modules/admin/views/AdminUserOverView.vue';
import AdminBannersView from '@/modules/admin/views/AdminBannersView.vue';
import AdminSingleUserView from '@/modules/admin/views/AdminSingleUserView.vue';
import AdminMaintainerView from '@/modules/admin/views/AdminMaintainerView.vue';

export function adminRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/user',
          name: 'users',
          component: AdminUserOverView,
          meta: {
            requiresAuth: true,
            // TODO: Change to `action: get` after https://github.com/GEWIS/sudosos-backend/issues/62 is fully finished
            isAllowed: () => isAllowed('update', ['all'], 'User', ['any']),
          },
        },
        {
          path: '/banner',
          component: AdminBannersView,
          name: 'banners',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Banner', ['any']),
          },
        },
        {
          path: '/user/:userId',
          component: AdminSingleUserView,
          name: 'user',
          props: true,
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['all'], 'User', ['any']),
          },
        },
        {
          path: '/maintainer',
          component: AdminMaintainerView,
          name: 'maintainer',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('update', ['all'], 'Maintenance', ['*']),
          },
        },
      ],
    },
  ];
}
