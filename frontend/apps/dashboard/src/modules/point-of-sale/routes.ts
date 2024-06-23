import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import POSOverviewView from "@/modules/point-of-sale/views/POSOverviewView.vue";
import POSInfoView from "@/modules/point-of-sale/views/POSInfoView.vue";
import POSCreateView from "@/modules/point-of-sale/views/POSCreateView.vue";
import POSEditView from "@/modules/point-of-sale/views/POSEditView.vue";

export function posRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/point-of-sale/overview',
          name: 'pointOfSale',
          component: POSOverviewView,
          meta: { requiresAuth: true, isSeller: true }
        },
        {
          path: '/point-of-sale/info/:id',
          name: 'pointOfSaleInfo',
          component: POSInfoView,
          props: true,
          meta: { requiresAuth: true, isSeller: true }
        },
        {
          path: '/point-of-sale/request',
          name: 'pointOfSaleCreate',
          component: POSCreateView,
          meta: { requiresAuth: true, isSeller: true }
        },
        {
          path: '/point-of-sale/edit/:id',
          name: 'pointOfSaleEdit',
          component: POSEditView,
          props: true,
          meta: { requiresAuth: true, isSeller: true }
        },
      ]
    }
  ];
}
