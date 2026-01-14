import { createRouter, createWebHistory } from 'vue-router';
import { clearTokenInStorage, useAuthStore, getTokenFromStorage } from '@sudosos/sudosos-frontend-common';
import CashierView from '../views/CashierView.vue';
import LoginView from '@/views/LoginView.vue';
import NoPosTokenView from '@/views/NoPosTokenView.vue';
import { getBasePath } from '@/utils/basePathUtils';
import { usePosToken, POS_TOKEN_KEY } from '@/composables/usePosToken';

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

const posTokenGuard = () => {
  const { hasPosToken } = usePosToken();

  if (hasPosToken.value) {
    // POS token exists, allow navigation
    return;
  } else {
    // No POS token, redirect to configure POS
    return { name: 'configure-pos' };
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
      beforeEnter: [authGuard, posTokenGuard],
    },
    {
      path: '/configure-pos',
      name: 'configure-pos',
      component: NoPosTokenView,
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

router.beforeEach((to, from, next) => {
  // Check if user token exists in storage
  const userToken = getTokenFromStorage();
  const hasUserToken = !!userToken.token;
  // Check if POS token exists in storage (even if expired)
  const posTokenData = getTokenFromStorage(POS_TOKEN_KEY);
  const hasPosTokenInStorage = !!posTokenData.token;

  // If no POS token => go to configure-pos
  // (unless already going to configure-pos)
  if (!hasPosTokenInStorage && to.name !== 'configure-pos') {
    next({ name: 'configure-pos' });
    return;
  }

  // If POS token exists but no user token => go to login
  // (unless already going to login or configure-pos)
  if (hasPosTokenInStorage && !hasUserToken && to.name !== 'login' && to.name !== 'configure-pos') {
    next({ name: 'login' });
    return;
  }

  next();
});

export default router;
