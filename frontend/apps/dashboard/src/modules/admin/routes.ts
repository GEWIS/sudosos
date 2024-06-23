import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import AdminUserOverView from "@/modules/admin/views/AdminUserOverView.vue";
import AdminBannersView from "@/modules/admin/views/AdminBannersView.vue";
import AdminSingleUserView from "@/modules/admin/views/AdminSingleUserView.vue";

export function adminRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/user-overview',
          name: 'userOverview',
          component: AdminUserOverView,
          meta: { requiresAuth: true, isBAC: true, isBoard: true }
        },
        {
          path: '/banners',
          component: AdminBannersView,
          name: 'banners',
          meta: { requiresAuth: true, isBoard: true }
        },
        {
          path: '/user/:userId',
          component: AdminSingleUserView,
          name: 'user',
          props: true,
        },
      ],
    }
  ];
}
