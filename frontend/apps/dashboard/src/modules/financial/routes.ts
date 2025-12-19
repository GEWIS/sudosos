import type { RouteRecordRaw } from 'vue-router';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import DashboardLayout from '@/layout/DashboardLayout.vue';
import PayoutsView from '@/modules/financial/views/payouts/PayoutsView.vue';
import InvoiceOverview from '@/modules/financial/views/invoice/InvoiceOverview.vue';
import InvoiceInfoView from '@/modules/financial/views/invoice/InvoiceInfoView.vue';
import InvoiceCreateView from '@/modules/financial/views/invoice/InvoiceCreateView.vue';
import DebtorView from '@/modules/financial/views/debtor/DebtorView.vue';
import DebtorHandoutView from '@/modules/financial/views/debtor/DebtorHandoutView.vue';
import WriteOffsView from '@/modules/financial/views/write-offs/WriteOffsView.vue';
import TransactionView from '@/modules/financial/views/transaction/TransactionView.vue';
import SellerView from '@/modules/financial/views/seller/SellerView.vue';
import VatView from '@/modules/financial/views/vat/VatView.vue';

export function financialRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/financial/debtor',
          component: DebtorView,
          name: 'Debtors',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Fine', ['any']),
          },
        },
        {
          path: '/financial/debtor/:id',
          component: DebtorHandoutView,
          name: 'debtorSingleHandout',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Fine', ['any']),
          },
        },
        {
          path: '/financial/invoice',
          component: InvoiceOverview,
          name: 'invoices',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Invoice', ['any']),
          },
        },
        {
          path: '/financial/invoice/create',
          component: InvoiceCreateView,
          name: 'invoiceCreate',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('create', ['own', 'organ'], 'Invoice', ['any']),
          },
        },
        {
          path: '/financial/invoice/:id',
          redirect: (to) => {
            const { id } = to.params;
            return `/invoice/${id as string}/info`;
          },
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Invoice', ['any']),
          },
        },
        {
          path: '/financial/invoice/:id/info',
          name: 'invoiceInfo',
          component: InvoiceInfoView,
          props: true,
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Invoice', ['any']),
          },
        },
        {
          path: '/financial/payout',
          component: PayoutsView,
          name: 'payouts',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'SellerPayout', ['any']),
          },
        },
        {
          path: '/financial/write-off',
          component: WriteOffsView,
          name: 'writeOffs',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['all'], 'WriteOff', ['any']),
          },
        },
        {
          path: '/financial/transaction',
          component: TransactionView,
          name: 'financial-transactions',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('update', ['all'], 'Transaction', ['any']),
          },
        },
        {
          path: '/financial/seller',
          component: SellerView,
          name: 'sellers',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['all'], 'User', ['any']),
          },
        },
        {
          path: '/financial/vat',
          component: VatView,
          name: 'vat',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['all'], 'VatGroup', ['any']),
          },
        },
      ],
    },
  ];
}
