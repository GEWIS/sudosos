import { computed, ref, watch, onUnmounted, type Ref } from 'vue';
import { BaseTransactionResponse, PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useCartStore } from '@/stores/cart.store';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useSettingStore } from '@/stores/settings.store';
import { userApiService } from '@/services/ApiService';

export function useCartTransactions(pointOfSale?: Ref<PointOfSaleWithContainersResponse | null>) {
  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const posStore = usePointOfSaleStore();
  const settings = useSettingStore();

  const transactions = ref<BaseTransactionResponse[]>([]);
  const isLoadingTransactions = ref(false);
  const loadingBuyerId = ref<number | null>(null);
  const shouldShowTransactions = computed(() => cartStore.cartTotalCount === 0);

  const current = computed(() => cartStore.getBuyer);
  const isOwnBuyer = computed(() => {
    if (!authStore.user) return false;
    return current.value?.id === authStore.user.id;
  });

  const getUserRecentTransactions = async () => {
    const currentBuyerId = cartStore.getBuyer?.id;
    if (!currentBuyerId) return;
    if (isLoadingTransactions.value && loadingBuyerId.value === currentBuyerId) return;

    const buyerIdForThisCall = currentBuyerId;
    isLoadingTransactions.value = true;
    loadingBuyerId.value = buyerIdForThisCall;
    transactions.value = [];

    try {
      if (cartStore.getBuyer && (cartStore.getBuyer.id === authStore.getUser?.id || settings.isBorrelmode)) {
        const res = await userApiService.user.getUsersTransactions(
          cartStore.getBuyer?.id,
          cartStore.getBuyer?.id,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          5,
        );

        if (loadingBuyerId.value === buyerIdForThisCall && cartStore.getBuyer?.id === buyerIdForThisCall) {
          transactions.value.push(...res.data.records);
        }
      }
    } finally {
      if (loadingBuyerId.value === buyerIdForThisCall) {
        isLoadingTransactions.value = false;
        loadingBuyerId.value = null;
      }
    }
  };

  const getPointOfSaleRecentTransactions = async () => {
    transactions.value = [];
    const res = await posStore.fetchRecentPosTransactions();

    if (res) transactions.value.push(...res.records);
  };

  const displayName = () => {
    if (!current.value) return 'no one';

    if (isOwnBuyer.value && !settings.isBorrelmode) {
      return current.value?.firstName;
    } else {
      return `${current.value?.firstName} ${current.value?.lastName}`;
    }
  };

  const isOfAge = () => {
    return current.value?.ofAge ?? true;
  };

  const lockUser = () => {
    const lockedIn = cartStore.lockedIn;
    if (lockedIn) {
      if (current.value?.id === lockedIn.id) {
        cartStore.setLockedIn(null);
        return;
      }
    }

    if (current.value) cartStore.setLockedIn(current.value);
  };

  const showLock = () => {
    if (cartStore.lockedIn) return true;
    return current.value && settings.isBorrelmode;
  };

  let refreshRecentPosTransactions: ReturnType<typeof setInterval> | null = null;
  const refreshInterval = 1000 * 60 * 5;

  const getRefreshInterval = () => setInterval(() => void getPointOfSaleRecentTransactions(), refreshInterval);

  const clearIfExists = () => {
    if (refreshRecentPosTransactions) clearInterval(refreshRecentPosTransactions);
  };

  const loadTransactions = async () => {
    if (!pointOfSale?.value) return;
    if (pointOfSale.value.useAuthentication) {
      clearIfExists();
      await getUserRecentTransactions();
    } else {
      clearIfExists();
      await getPointOfSaleRecentTransactions();
      refreshRecentPosTransactions = getRefreshInterval();
    }
  };

  if (pointOfSale) {
    watch(pointOfSale, async () => {
      if (shouldShowTransactions.value) await loadTransactions();
    });
  }

  onUnmounted(() => {
    clearIfExists();
  });

  return {
    transactions,
    isLoadingTransactions,
    shouldShowTransactions,
    getUserRecentTransactions,
    getPointOfSaleRecentTransactions,
    loadTransactions,
    displayName,
    isOfAge,
    lockUser,
    showLock,
  };
}
