import { computed, ref, watch, onUnmounted, type Ref } from 'vue';
import type { Socket } from 'socket.io-client';
import { BaseTransactionResponse, PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { useAuthStore, useWebSocketStore } from '@sudosos/sudosos-frontend-common';
import { useCartStore } from '@/stores/cart.store';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useSettingStore } from '@/stores/settings.store';
import { userApiService } from '@/services/ApiService';
import { usePosToken } from '@/composables/usePosToken';

const POS_TRANSACTIONS_ROOM_PREFIX = 'pos:';
const POS_TRANSACTIONS_ROOM_SUFFIX = ':transactions';
const RECENT_TRANSACTIONS_MAX = 50;

export function useCartTransactions(pointOfSale?: Ref<PointOfSaleWithContainersResponse | null>) {
  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const posStore = usePointOfSaleStore();
  const settings = useSettingStore();
  const posToken = usePosToken();

  const transactions = ref<BaseTransactionResponse[]>([]);
  const openTransactionId = ref<number | null>(null);
  const isLoadingTransactions = ref(false);
  const loadingBuyerId = ref<number | null>(null);
  const shouldShowTransactions = computed(() => cartStore.cartTotalCount === 0);
  const hasToken = computed(() => !!authStore.getToken || posToken.hasPosToken.value);

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

  const clearPollingIfExists = () => {
    if (refreshRecentPosTransactions) {
      clearInterval(refreshRecentPosTransactions);
      refreshRecentPosTransactions = null;
    }
  };

  let unsubscribePosTransactions: (() => void) | null = null;
  let subscribedPosId: number | null = null;

  function subscribeToPosTransactions(posId: number): boolean {
    if (subscribedPosId === posId) return true;
    clearPosTransactionsSubscription();
    subscribedPosId = posId;

    const wsStore = useWebSocketStore();
    let socket: Socket;
    try {
      socket = wsStore.getSocket;
    } catch {
      subscribedPosId = null;
      return false;
    }
    const room = `${POS_TRANSACTIONS_ROOM_PREFIX}${posId}${POS_TRANSACTIONS_ROOM_SUFFIX}`;

    const onTransactionCreated = (payload: BaseTransactionResponse) => {
      const alreadyInList = transactions.value.some((t) => t.id === payload.id);
      if (!alreadyInList) {
        transactions.value = [payload, ...transactions.value].slice(0, RECENT_TRANSACTIONS_MAX);
        openTransactionId.value = payload.id;
      }
    };
    const onConnect = () => {
      socket.emit('subscribe', room);
      void getPointOfSaleRecentTransactions();
    };

    socket.emit('subscribe', room);
    socket.on('transaction:created', onTransactionCreated);
    socket.on('connect', onConnect);

    unsubscribePosTransactions = () => {
      socket.off('transaction:created', onTransactionCreated);
      socket.off('connect', onConnect);
      socket.emit('unsubscribe', room);
      unsubscribePosTransactions = null;
      subscribedPosId = null;
    };
    return true;
  }

  const clearPosTransactionsSubscription = () => {
    if (unsubscribePosTransactions) {
      unsubscribePosTransactions();
    }
  };

  const loadTransactions = async () => {
    if (!pointOfSale?.value) return;
    if (pointOfSale.value.useAuthentication) {
      clearPollingIfExists();
      clearPosTransactionsSubscription();
      await getUserRecentTransactions();
    } else {
      clearPollingIfExists();
      clearPosTransactionsSubscription();
      await getPointOfSaleRecentTransactions();
      if (hasToken.value) {
        const subscribed = subscribeToPosTransactions(pointOfSale.value.id);
        if (!subscribed) {
          refreshRecentPosTransactions = getRefreshInterval();
        }
      } else {
        refreshRecentPosTransactions = getRefreshInterval();
      }
    }
  };

  if (pointOfSale) {
    watch(pointOfSale, async () => {
      if (shouldShowTransactions.value) await loadTransactions();
    });
  }

  onUnmounted(() => {
    clearPollingIfExists();
    clearPosTransactionsSubscription();
  });

  return {
    transactions,
    openTransactionId,
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
