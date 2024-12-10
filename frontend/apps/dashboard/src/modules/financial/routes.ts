import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import FineView from "@/modules/financial/views/FineView.vue";
import PayoutsView from "@/modules/financial/views/payouts/PayoutsView.vue";
import InvoiceOverview from "@/modules/financial/views/invoice/InvoiceOverview.vue";
import InvoiceInfoView from "@/modules/financial/views/invoice/InvoiceInfoView.vue";
import { isAllowed } from "@/utils/permissionUtils";
import InvoiceCreateView from "@/modules/financial/views/invoice/InvoiceCreateView.vue";

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
        name: 'fines',
        meta: {
          requiresAuth: true,
          isAllowed: () => isAllowed('get', ['own', 'organ'], 'Fine', ['any'])
        }
      },
      {
        path: '/invoice',
        component: InvoiceOverview,
        name: 'invoices',
        meta: {
          requiresAuth: true,
          isAllowed: () => isAllowed('get', ['own', 'organ'], 'Invoice', ['any'])
        }
      },
      {
        path: '/invoice/create',
        component: InvoiceCreateView,
        name: 'invoiceCreate',
        meta: {
          requiresAuth: true,
          isAllowed: () => isAllowed('create', ['own', 'organ'], 'Invoice', ['any'])
        }
      },
      {
        path: '/invoice/:id',
        redirect: to => {
            const { id } = to.params;
            return `/invoice/${id}/info`;
        },
        meta: {
        requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Invoice', ['any'])
        }
      },
      {
        path: '/invoice/:id/info',
        name: 'invoiceInfo',
        component: InvoiceInfoView,
        props: true,
        meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Invoice', ['any'])
        }
      },
      {
        path: '/payout',
        component: PayoutsView,
        name: 'payouts',
        meta: {
          requiresAuth: true,
          isAllowed: () => isAllowed('get', ['own', 'organ'], 'SellerPayout', ['any'])
        }
      }
      ]
    }
  ];
}
