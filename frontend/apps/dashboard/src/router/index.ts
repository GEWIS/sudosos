import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, useAuthStore } from '@sudosos/sudosos-frontend-common';
import PublicLayout from '@/layout/PublicLayout.vue';
import DashboardLayout from '@/layout/DashboardLayout.vue';
import ErrorView from '@/views/ErrorView.vue';
import { authRoutes } from '@/modules/auth/routes';
import { adminRoutes } from '@/modules/admin/routes';
import { financialRoutes } from '@/modules/financial/routes';
import { sellerRoutes } from '@/modules/seller/routes';
import { userRoutes } from '@/modules/user/routes';
import WrappedView from '@/views/WrappedView.vue';

declare module 'vue-router' {
  interface RouteMeta {
    // must be declared by every route
    requiresAuth: boolean;
    isAllowed?: () => boolean;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...authRoutes(),
    ...adminRoutes(),
    ...financialRoutes(),
    ...sellerRoutes(),
    ...userRoutes(),
    {
      path: '',
      component: PublicLayout,
      children: [
        {
          path: '/error',
          component: ErrorView,
          name: 'error',
        },
      ],
    },
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
        {
          path: 'wrapped',
          component: WrappedView,
          name: 'wrapped',
        },
      ],
    },
    // Catch-all route to home
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const hasTOSAccepted = () => {
    return authStore.acceptedToS || authStore.user?.acceptedToS;
  };

  const isAuth = isAuthenticated();

  if (to.meta?.requiresAuth && !isAuth) {
    // If the route requires authentication and the user is not authenticated, redirect to login
    sessionStorage.setItem('fromPath', window.location.pathname);
    next({ name: 'login' });
  } else if (isAuth && hasTOSAccepted() == 'NOT_ACCEPTED' && to.name !== 'tos') {
    // If the user is authenticated but user hasn't accepted the TOS, always redirect to TOS
    next({ name: 'tos' });
  } else if (!to.meta?.requiresAuth && isAuth && hasTOSAccepted() == 'ACCEPTED') {
    // If the route doesn't require authentication and the user is authenticated, redirect to home
    next({ name: 'home' });
  } else if (to.meta?.isAllowed) {
    // Permission guard present, so let's test is
    if (to.meta?.isAllowed()) {
      next();
    } else {
      next({ name: 'home' });
    }
  } else {
    // Always allowed
    next();
  }
});

export default router;
