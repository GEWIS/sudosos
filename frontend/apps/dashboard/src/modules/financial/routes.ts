import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import FineView from "@/modules/financial/views/FineView.vue";
import { UserRole } from "@/utils/rbacUtils";
import InvoiceOverview from "@/modules/financial/views/invoice/InvoiceOverview.vue";
import InvoiceInfoView from "@/modules/financial/views/invoice/InvoiceInfoView.vue";

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
        {
          path: '/invoice',
          component: InvoiceOverview,
          name: 'invoice',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BAC_PM]
          }
        },
        {
          path: '/invoice/:id/info',
          name: 'invoiceInfo',
          component: InvoiceInfoView,
          props: true,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BAC_PM]
          }
        },
      ]
    }
  ];
}
