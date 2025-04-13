<template>
  <div class="flex flex-column h-full">
    <div class="flex-container flex-row flex-wrap justify-content-between">
      <p class="accent-text font-bold font-size-lg mb-0">Current order for</p>
      <div class="active c-btn px-3 py-1 square text-2xl" @click="selectUser">
        <i class="pi pi-user pr-2 text-2xl" />
        {{ displayName() }}
      </div>
      <button
        v-if="showLock()"
        class="active c-btn lock min-w-70 px-3 py-2 square text-4xl"
        :class="{ disabled: disabledLock, active: lockedIn }"
        @click="lockUser"
      >
        <i class="text-4xl" :class="lockIcon" />
      </button>
    </div>
    <div v-if="!shouldShowTransactions || !showHistory" class="flex-column flex-grow-1 gap-2 mt-4 overflow-y-auto">
      <div v-for="item in cartItems" :key="item.product.id">
        <CartItemComponent :cart-product="item" />
      </div>
    </div>
    <TransactionHistoryComponent v-else-if="shouldShowTransactions" :transactions="transactions" />
    <div class="content-body font-size-lg mt-3 px-3 py-2 shadow-1">
      <div class="flex-between w-full">
        <div class="font-semibold">Total</div>
        <div class="font-bold font-size-lg">€{{ formatPrice(totalPrice) }}</div>
      </div>
      <div
        v-if="cartStore.buyerBalance != null"
        class="align-items-end flex-container font-size-md justify-content-between pt-2"
      >
        <span><i class="pi pi-exclamation-triangle" /> Debit after purchase: </span>
        €{{ formattedBalanceAfter }}
      </div>
    </div>
    <div class="flex-column mt-3">
      <CartActionsComponent @select-creator="emit('selectCreator')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { BaseTransactionResponse } from '@sudosos/sudosos-client';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { StoreGeneric, storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cart.store';
import CartItemComponent from '@/components/Cart/CartItemComponent.vue';
import apiService from '@/services/ApiService';
import { formatPrice } from '@/utils/FormatUtils';
import TransactionHistoryComponent from '@/components/Cart/TransactionHistory/TransactionHistoryComponent.vue';
import { useSettingStore } from '@/stores/settings.store';
import CartActionsComponent from '@/components/Cart/CartActionsComponent.vue';
import { usePointOfSaleStore } from '@/stores/pos.store';

const cartStore = useCartStore();
const authStore = useAuthStore();
const posStore = usePointOfSaleStore();
const settings = useSettingStore();

const cartItems = cartStore.getProducts;
const current = computed(() => cartStore.getBuyer);
const totalPrice = computed(() => cartStore.getTotalPrice);
const shouldShowTransactions = computed(() => cartStore.cartTotalCount === 0);
const showHistory = ref(true);

const { pointOfSale } = storeToRefs(posStore as StoreGeneric);
const { lockedIn } = storeToRefs(cartStore as StoreGeneric);
const transactions = ref<BaseTransactionResponse[]>([]);

const getUserRecentTransactions = async () => {
  transactions.value = [];
  if (cartStore.getBuyer && (cartStore.getBuyer.id === authStore.getUser?.id || settings.isBorrelmode)) {
    // todo clean up
    const res = await apiService.user.getUsersTransactions(
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

    transactions.value.push(...res.data.records);
  }
};

const getPointOfSaleRecentTransactions = async () => {
  transactions.value = [];
  const res = await posStore.fetchRecentPosTransactions();

  if (res) transactions.value.push(...res.records);
};

const isOwnBuyer = computed(() => {
  if (!authStore.user) return false;
  return current.value?.id === authStore.user.id;
});
const displayName = () => {
  if (!current.value) return 'no one';

  if (isOwnBuyer.value && !settings.isBorrelmode) {
    return current.value?.firstName;
  } else {
    return `${current.value?.firstName} ${current.value?.lastName}`;
  }
};

const lockUser = () => {
  if (lockedIn.value) {
    if (current.value?.id === lockedIn.value.id) {
      cartStore.setLockedIn(null);
      return;
    }
  }

  if (current.value) cartStore.setLockedIn(current.value);
};

const lockIcon = computed(() => {
  return cartStore.lockedIn ? 'pi pi-lock' : 'pi pi-unlock';
});

const disabledLock = computed(() => {
  if (!lockedIn) return true;
  return current.value?.id !== lockedIn.value?.id;
});

const showLock = () => {
  if (cartStore.lockedIn) return true;
  return current.value && settings.isBorrelmode;
};

onMounted(async () => {
  if (shouldShowTransactions.value) await getUserRecentTransactions();
});

watch(cartItems, () => {
  // if (!settings.isBorrelmode) showHistory.value = false;
});

watch(shouldShowTransactions, async () => {
  if (shouldShowTransactions.value) await getUserRecentTransactions();
});

watch(
  () => cartStore.buyer,
  async () => {
    if (shouldShowTransactions.value) await getUserRecentTransactions();
  },
);

let refreshRecentPosTransactions: number | null;

const refreshInterval = 1000 * 60 * 5;

const getRefreshInterval = () => setInterval(getPointOfSaleRecentTransactions, refreshInterval);

const clearIfExists = () => {
  if (refreshRecentPosTransactions) clearInterval(refreshRecentPosTransactions);
};

// TODO Use a websocket instead of this 'hacky' refresh.
watch(pointOfSale, async (target) => {
  if (!target) return;
  if (target.useAuthentication) {
    clearIfExists();
    await getUserRecentTransactions();
  } else {
    await getPointOfSaleRecentTransactions();
    refreshRecentPosTransactions = getRefreshInterval();
  }
});

onUnmounted(() => {
  clearIfExists();
});

const emit = defineEmits(['selectUser', 'selectCreator']);
const selectUser = () => {
  emit('selectUser');
};

const formattedBalanceAfter = computed(() => {
  if (cartStore.buyerBalance == null) return null;
  const price = cartStore.buyerBalance.amount - totalPrice.value;
  return formatPrice(price);
});
</script>

<style scoped lang="scss">
.lock {
  &.disabled {
    background-color: grey;
    opacity: 0.5;
    color: white;
  }
}
</style>
