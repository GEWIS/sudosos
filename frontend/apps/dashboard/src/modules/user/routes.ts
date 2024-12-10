import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import UserLandingView from "@/modules/user/views/UserLandingView.vue";
import UserTransactionsView from "@/modules/user/views/UserTransactionsView.vue";
import ProfileView from "@/modules/user/views/UserProfileView.vue";
import { isAllowed } from "@/utils/permissionUtils";

export function userRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          component: UserLandingView,
          name: 'home',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own'], 'User', ['any'])
          }
        },
        {
          path: '/transaction',
          component: UserTransactionsView,
          name: 'transactions',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own'], 'Transaction', ['any'])
          }
        },
        {
          path: '/profile',
          component: ProfileView,
          name: 'profile',
          meta: {
            requiresAuth: true,
            isAllowed: () => isAllowed('get', ['own'], 'User', ['any'])
          }
        },
      ]
    }
  ];
}
