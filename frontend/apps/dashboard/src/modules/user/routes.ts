import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import UserLandingView from "@/modules/user/views/UserLandingView.vue";
import UserTransactionsView from "@/modules/user/views/UserTransactionsView.vue";
import ProfileView from "@/modules/user/views/UserProfileView.vue";

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
          name: 'home'
        },
        {
          path: '/transaction',
          component: UserTransactionsView,
          name: 'transactions'
        },
        {
          path: '/profile',
          component: ProfileView,
          name: 'profile',
        },
      ]
    }
  ];
}
