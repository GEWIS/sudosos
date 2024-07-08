import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import ProductsContainersView from "@/modules/seller/views/ProductsContainersView.vue";
import { UserRole } from "@/utils/rbacUtils";

export function sellerRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/manage-products',
          component: ProductsContainersView,
          name: 'products-containers-overview',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER]
          }
        },
      ]
    }
  ];
}
