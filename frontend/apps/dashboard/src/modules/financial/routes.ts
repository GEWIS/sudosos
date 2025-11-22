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
          path: '/debtor',
          component: DebtorView,
          name: 'Debtors',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Fine', ['any']),
          },
        },
        {
          path: '/debtor/:id',
          component: DebtorHandoutView,
          name: 'debtorSingleHandout',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Fine', ['any']),
          },
        },
        {
          path: '/invoice',
          component: InvoiceOverview,
          name: 'invoices',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Invoice', ['any']),
          },
        },
        {
          path: '/invoice/create',
          component: InvoiceCreateView,
          name: 'invoiceCreate',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('create', ['own', 'organ'], 'Invoice', ['any']),
          },
        },
        {
          path: '/invoice/:id',
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
          path: '/invoice/:id/info',
          name: 'invoiceInfo',
          component: InvoiceInfoView,
          props: true,
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'Invoice', ['any']),
          },
        },
        {
          path: '/payout',
          component: PayoutsView,
          name: 'payouts',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own', 'organ'], 'SellerPayout', ['any']),
          },
        },
        {
          path: '/write-offs',
          component: WriteOffsView,
          name: 'writeOffs',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['all'], 'WriteOff', ['any']),
          },
        },
        {
          path: '/financial/transactions',
          component: TransactionView,
          name: 'financial-transactions',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('update', ['all'], 'Transaction', ['any']),
          },
        },
        {
          path: '/seller',
          component: SellerView,
          name: 'sellers',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['all'], 'User', ['any']),
          },
        },
        {
          path: '/vat',
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
