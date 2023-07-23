import { createRouter, createWebHistory } from 'vue-router';
import PublicLayout from "@/layout/PublicLayout.vue";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import HomeView from '../views/HomeView.vue';
import LoginView from "@/views/LoginView.vue";
import BalanceView from "@/views/BalanceView.vue";
import {useAuthStore} from "@sudosos/sudosos-frontend-common";
import POSOverviewView from "@/views/PointOfSale/POSOverviewView.vue";
import POSInfoView from "@/views/PointOfSale/POSInfoView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '',
      component: PublicLayout,
      children: [
        {
          path: '',
          component: LoginView,
          name: 'login',
        },
      ],
    },
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          component: HomeView,
          name: 'home',
        },
        {
          path: '/balance',
          component: BalanceView,
          name: 'balance',
        },
        {
          path: '/point-of-sale/overview',
          name: 'pointOfSale',
          component: POSOverviewView,
        },
        {
          path: '/point-of-sale/info/:id',
          name: 'pointOfSaleInfo',
          component: POSInfoView,
          props: true,
        },
        // Add other routes for authenticated users here
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = useAuthStore().getToken; // Replace with your actual authentication logic

  if (to.meta?.requiresAuth && !isAuthenticated) {
    // If the route requires authentication and the user is not authenticated, redirect to login
    next({ name: 'login' });
  } else if (!to.meta?.requiresAuth && isAuthenticated) {
    // If the route doesn't require authentication and the user is authenticated, redirect to home
    next({ name: 'home' });
  } else {
    // Allow navigation to proceed
    next();
  }
});

export default router;
