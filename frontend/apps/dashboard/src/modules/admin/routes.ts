import type { RouteRecordRaw } from 'vue-router';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import DashboardLayout from '@/layout/DashboardLayout.vue';
import AdminUserOverView from '@/modules/admin/views/AdminUserOverView.vue';
import AdminBannersView from '@/modules/admin/views/AdminBannersView.vue';
import AdminSingleUserView from '@/modules/admin/views/AdminSingleUserView.vue';
import AdminMaintainerView from '@/modules/admin/views/AdminMaintainerView.vue';
import AdminRBACView from '@/modules/admin/views/AdminRBACView.vue';
import AdminDashboardView from '@/modules/admin/views/AdminDashboardView.vue';

export function canViewAdminDashboard(): boolean {
  return (
    isAllowed('get', ['all'], 'User', ['any']) &&
    isAllowed('get', ['all'], 'Balance', ['any']) &&
    isAllowed('get', ['all'], 'PayoutRequest', ['any']) &&
    isAllowed('get', ['all'], 'Invoice', ['any']) &&
    isAllowed('get', ['all'], 'Fine', ['any'])
  );
}

export function adminRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/admin',
          component: AdminDashboardView,
          name: 'adminDashboard',
          meta: {
            requiresAuth: true,
            isAllowed: () => canViewAdminDashboard(),
            title: 'modules.admin.dashboard.title',
          },
        },
        {
          path: '/user',
          name: 'users',
          component: AdminUserOverView,
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['all'], 'User', ['any']),
            title: 'common.titles.users',
          },
        },
        {
          path: '/admin/banner',
          component: AdminBannersView,
          name: 'banners',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Banner', ['any']),
            title: 'common.titles.banners',
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
            title: 'common.titles.maintainer',
          },
        },
        {
          path: '/rbac',
          component: AdminRBACView,
          name: 'rbac',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['all'], 'Role', ['*']),
            title: 'common.titles.rbac',
          },
        },
      ],
    },
  ];
}
