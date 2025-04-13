import { createRouter, createWebHistory } from 'vue-router';
import { clearTokenInStorage, useAuthStore } from '@sudosos/sudosos-frontend-common';
import CashierView from '../views/CashierView.vue';
import LoginView from '@/views/LoginView.vue';
import { getBasePath } from '@/utils/basePathUtils';

const authGuard = () => {
  const authStore = useAuthStore();

  if (authStore.getToken) {
    // User is logged in, allow navigation to the next route
    return;
  } else {
    clearTokenInStorage();
    // User is not logged in, redirect to the root path
    return '/';
  }
};

const baseUrl = getBasePath();

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes: [
    {
      path: '/cashier',
      name: 'cashier',
      component: CashierView,
      beforeEnter: authGuard, // Apply the navigation guard
    },
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
