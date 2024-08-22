import { createRouter, createWebHistory } from 'vue-router';
import PublicLayout from "@/layout/PublicLayout.vue";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import { isAuthenticated, useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import 'vue-router';
import ErrorView from "@/views/ErrorView.vue";
import { authRoutes } from "@/modules/auth/routes";
import { adminRoutes } from "@/modules/admin/routes";
import { financialRoutes } from "@/modules/financial/routes";
import { sellerRoutes } from "@/modules/seller/routes";
import { userRoutes } from "@/modules/user/routes";

declare module 'vue-router' {
  interface RouteMeta {
    // must be declared by every route
    requiresAuth: boolean

    rolesAllowed?: string[]
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
      ]
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
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();

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
    if(to.meta?.rolesAllowed) {
      // Test overlapping roles between the allowed roles and the roles the user has
      const rolesUnion = [...new Set([...to.meta.rolesAllowed, ...userStore.current.rolesWithPermissions.map(r => r.name)])];

      // No overlapping roles -> No correct permissions -> Back to home
      if(rolesUnion.length == 0) ({ name: 'home' });
    }

    next();
  }
});

export default router;
