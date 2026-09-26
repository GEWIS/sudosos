import { clearTokenInStorage, useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { useCartStore } from '@/stores/cart.store';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useTerminalPaymentStore } from '@/stores/terminalPayment.store';
import router from '@/router';
import { usePosToken } from '@/composables/usePosToken';

export async function logoutService(forceClear = false) {
  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const posStore = usePointOfSaleStore();

  authStore.$reset();
  cartStore.$reset();
  // The payment dialog's visibility lives in this store, so without this it
  // would reopen (and start a new payment) on the next login.
  useTerminalPaymentStore().reset();

  if (forceClear) {
    posStore.$reset();
  } else {
    // Normal logout: only clear user's list of POS, preserve current POS.
    posStore.usersPointOfSales = null;
  }

  userStore.clearCurrent();
  clearTokenInStorage();
  await router.push({ name: 'login' });
}

export async function logoutPosService() {
  const posToken = usePosToken();
  posToken.clearPosToken();
  usePointOfSaleStore().$reset();
  await logoutService();
}
