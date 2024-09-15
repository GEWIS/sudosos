<template>
  <div class="flex flex-column h-full">
    <div class="flex-container flex-row flex-wrap justify-content-between">
      <p class="font-bold font-size-lg accent-text mb-0">Current order for</p>
      <div class="c-btn active square text-2xl px-3 py-1" @click="selectUser">
        <i class="pi pi-user text-2xl pr-2"/>
        {{ displayName() }}
      </div>
      <button v-if="showLock()" :class="{ disabled: disabledLock, active: lockedIn}"
              class="c-btn lock active square text-4xl px-3 py-2 min-w-70" @click="lockUser">
        <i :class="lockIcon" class="text-4xl"/>
      </button>
    </div>
    <div class="overflow-y-auto flex-grow-1 my-2" v-if="!shouldShowTransactions || !showHistory">
      <div v-for="item in cartItems" :key="item.product.id">
        <CartItemComponent :cart-product="item"/>
      </div>
    </div>
    <TransactionHistoryComponent v-else-if="shouldShowTransactions" :transactions="transactions"/>
    <div class="content-body px-3 py-2 font-size-lg mt-3">
      <div class="flex-between w-full">
        <div class="font-semibold">Total</div>
        <div class="font-bold font-size-lg">€{{ formatPrice(totalPrice) }}</div>
      </div>
      <div class="font-size-md pt-2 align-items-end flex-container justify-content-between"
           v-if="cartStore.buyerBalance != null">
        <span><i
          class="pi pi-exclamation-triangle"/> Debit after purchase: </span>
        €{{ formattedBalanceAfter }}
      </div>
    </div>
    <div class="flex-column mt-3">
      <CartActionsComponent @select-creator="emit('selectCreator')"/>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useCartStore } from '@/stores/cart.store';
import CartItemComponent from '@/components/Cart/CartItemComponent.vue';
import apiService from '@/services/ApiService';
import { formatPrice } from '@/utils/FormatUtils';
import TransactionHistoryComponent from
    '@/components/Cart/TransactionHistory/TransactionHistoryComponent.vue';
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { BaseTransactionResponse } from "@sudosos/sudosos-client";
import { useSettingStore } from "@/stores/settings.store";
import CartActionsComponent from "@/components/Cart/CartActionsComponent.vue";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { storeToRefs } from "pinia";

const cartStore = useCartStore();
const authStore = useAuthStore();
const posStore = usePointOfSaleStore();
const settings = useSettingStore();

const cartItems = cartStore.getProducts;
const current = computed(() => cartStore.getBuyer);
const totalPrice = computed(() => cartStore.getTotalPrice);
const shouldShowTransactions = computed(() => cartStore.cartTotalCount === 0);
const showHistory = ref(true);

const { pointOfSale } = storeToRefs(posStore);
const { lockedIn } = storeToRefs(cartStore);
const transactions = ref<BaseTransactionResponse[]>([]);

const getUserRecentTransactions = () => {
  transactions.value = [];
  if (cartStore.getBuyer) {
    // todo clean up
    apiService.user
      .getUsersTransactions(
        cartStore.getBuyer?.id,
        cartStore.getBuyer?.id,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        5
      )
      .then((res) => {
        transactions.value.push(...res.data.records);
      });
  }
};

const getPointOfSaleRecentTransactions = () => {
  transactions.value = [];
  posStore.fetchRecentPosTransactions().then((res) => {
    if (res) transactions.value.push(...res.records);
  });
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
  if (shouldShowTransactions.value) getUserRecentTransactions();
});

watch(cartItems, () => {
  // if (!settings.isBorrelmode) showHistory.value = false;
});

watch(shouldShowTransactions, () => {
  if (shouldShowTransactions.value) getUserRecentTransactions();
});

watch(
  () => cartStore.buyer,
  () => {
    if (shouldShowTransactions.value) getUserRecentTransactions();
  }
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
