import { createRouter, createWebHistory } from 'vue-router';
import PublicLayout from "@/layout/PublicLayout.vue";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import { isAuthenticated, useAuthStore } from "@sudosos/sudosos-frontend-common";
import { UserRole } from '@/utils/rbacUtils';
import 'vue-router';
import ErrorView from "@/views/ErrorView.vue";
import { authRoutes } from "@/modules/auth/routes";
import { posRoutes } from "@/modules/point-of-sale/routes";
import { adminRoutes } from "@/modules/admin/routes";
import { financialRoutes } from "@/modules/financial/routes";
import { sellerRoutes } from "@/modules/seller/routes";
import { userRoutes } from "@/modules/user/routes";

declare module 'vue-router' {
  interface RouteMeta {
    // must be declared by every route
    requiresAuth: boolean

    // Board
    isBoard?: boolean,

    // Seller
    isSeller?: boolean,

    // BAC
    isBAC?: boolean,
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '',
      component: PublicLayout,
      children: [
        {
          path: '/error',
          component: ErrorView,
          name: 'error',
        },
      ]
    },
    ...authRoutes(),
    ...posRoutes(),
    ...adminRoutes(),
    ...financialRoutes(),
    ...sellerRoutes(),
    ...userRoutes(),
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/error',
          component: ErrorView,
          name: 'error',
        },
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isBoard = () => {
    return authStore.roles.includes(UserRole.BOARD);
  };

  const isBAC = () => {
    return authStore.roles.includes(UserRole.BAC);
  };

  const isSeller = () => {
    return authStore.roles.includes(UserRole.SELLER);
  };

  const hasTOSAccepted = () => {
    return authStore.acceptedToS || authStore.user?.acceptedToS;
  };

  const isAuth = isAuthenticated();

  if (to.meta?.requiresAuth && !isAuth) {
    // If the route requires authentication and the user is not authenticated, redirect to login
    next({ name: 'login' });
  } else if (isAuth && hasTOSAccepted() == 'NOT_ACCEPTED' && to.name !== 'tos') {
    // If the user is authenticated but user hasn't accepted the TOS, always redirect to TOS
    next({ name: 'tos' });
  } else if (!to.meta?.requiresAuth && isAuth && hasTOSAccepted() == 'ACCEPTED') {
    // If the route doesn't require authentication and the user is authenticated, redirect to home
    next({ name: 'home' });
  } else {
    if(to.meta?.isBoard && !isBoard()) next({ name: 'home' });

    if(to.meta?.isSeller && !isSeller()) next({ name: 'home' });

    if(to.meta?.isBAC && !isBAC()) next({ name: 'home' });

    next();
  }
});

export default router;
