import { computed, ref, onMounted, type Ref, watch } from 'vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import type { BalanceResponse } from '@sudosos/sudosos-client';
import { useRouter } from 'vue-router';
import { formatPrice } from '@/utils/formatterUtils';
import apiService from '@/services/ApiService';

export function useUserBalance() {
  const userStore = useUserStore();
  const router = useRouter();

  const userBalance: Ref<BalanceResponse | null> = ref(null);
  const loading: Ref<boolean> = ref(false);

  const updateUserBalance = async () => {
    const auth = useAuthStore();
    if (!auth.getUser) {
      await router.replace({ path: '/error' });
      return;
    }

    loading.value = true;
    await userStore
      .fetchCurrentUserBalance(auth.getUser.id, apiService)
      .then((b: BalanceResponse) => {
        userBalance.value = b;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  onMounted(() => {
    userBalance.value = userStore.getCurrentUser.balance;
    setTimeout(updateUserBalance, 1000);
  });

  watch(userStore, () => {
    userBalance.value = userStore.getCurrentUser.balance;
  });

  const isAllFine = computed(() => {
    if (!userBalance.value?.fine) return false;
    return userBalance.value.fine.amount >= -1 * userBalance.value?.amount.amount;
  });

  const displayFine = computed(() => {
    if (!userBalance.value?.fine) return undefined;
    return formatPrice(userBalance.value.fine || { amount: 0, currency: 'EUR', precision: 2 });
  });

  const displayBalance = computed(() => {
    return formatPrice(userBalance.value?.amount || { amount: 0, currency: 'EUR', precision: 2 });
  });

  return {
    userBalance,
    loading,
    updateUserBalance,
    isAllFine,
    displayFine,
    displayBalance,
  };
}
