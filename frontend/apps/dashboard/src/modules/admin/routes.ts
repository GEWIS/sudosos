import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import AdminUserOverView from "@/modules/admin/views/AdminUserOverView.vue";
import AdminBannersView from "@/modules/admin/views/AdminBannersView.vue";
import AdminSingleUserView from "@/modules/admin/views/AdminSingleUserView.vue";
import { UserRole } from "@/utils/rbacUtils";

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
            rolesAllowed: [UserRole.BAC_PM, UserRole.BAC, UserRole.BOARD]
          }
        },
        {
          path: '/banner',
          component: AdminBannersView,
          name: 'banners',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BOARD]
          }
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
