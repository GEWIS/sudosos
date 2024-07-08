import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import FineView from "@/modules/financial/views/FineView.vue";
import { UserRole } from "@/utils/rbacUtils";

export function financialRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
        path: '/fine',
        component: FineView,
        name: 'fine',
        meta: {
          requiresAuth: true,
          rolesAllowed: [UserRole.BAC_PM]
        }
      },
      ]
    }
  ];
}
