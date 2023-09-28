import { createRouter, createWebHistory } from 'vue-router';
import { clearTokenInStorage, useAuthStore } from '@sudosos/sudosos-frontend-common';
import LoginView from '@/views/LoginView.vue';
import CashierView from '../views/CashierView.vue';

const authGuard = (to: any, from: any, next: any) => {
  const authStore = useAuthStore();

  if (authStore.getToken) {
    // User is logged in, allow navigation to the next route
    next();
  } else {
    clearTokenInStorage();
    // User is not logged in, redirect to the root path
    next('/');
  }
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/cashier',
      name: 'cashier',
      component: CashierView,
      beforeEnter: authGuard // Apply the navigation guard
    },
    {
      path: '/',
      name: 'login',
      component: LoginView
    }
  ]
});

export default router;
