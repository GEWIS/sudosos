import { clearTokenInStorage, useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { useCartStore } from '@/stores/cart.store';
import router from '@/router';

export async function logoutService() {
  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const userStore = useUserStore();

  authStore.$reset();
  cartStore.$reset();
  userStore.clearCurrent();
  clearTokenInStorage();
  await router.push({ name: 'login' });
}
