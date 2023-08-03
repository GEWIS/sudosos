<template>
  <div class="flex-column h-100">
    <div class="flex-container flex-row flex-wrap justify-content-between">
      <p class="fw-bolder font-size-lg mb-0">Current order for</p>
      <div class="c-btn active square fs-4 px-3 py-1" @click="selectUser">
        <font-awesome-icon v-if="current" icon="fa-solid fa-user" class="pe-2" />
        {{ displayName() }}
      </div>
    </div>
    <div class="overflow-y-auto flex-grow-1 my-2" v-if="!shouldShowTransactions || !showHistory">
      <div v-for="item in cartItems" :key="item.product.id">
        <CartItemComponent :cart-product="item" />
      </div>
    </div>
    <TransactionHistoryComponent v-else-if="shouldShowTransactions" :transactions="transactions" />
    <div class="content-body px-3 py-2 font-size-lg mt-3">
      <div class="flex-between w-100">
        <div class="fw-bold">Total</div>
        <div class="fw-bolder font-size-lg">€{{ formatPrice(totalPrice) }}</div>
      </div>
      <div class="font-size-sm pt-2 align-items-end" v-if="balance">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
        Debit after purchase is €{{ formattedBalanceAfter }}
      </div>
    </div>
    <div class="flex-column mt-3">
      <CartActionsComponent @select-creator="emit('selectCreator')"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
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
const balance = ref<number | null>(null);

const { pointOfSale } = storeToRefs(posStore);
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

const getBalance = async () => {
  if (!cartStore.buyer) return 0;
  try {
    const response = await apiService.balance.getBalanceId(cartStore.buyer.id);
    return response.data.amount.amount;
  } catch (error) {
    return null;
  }
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

onMounted(async () => {
  balance.value = await getBalance();
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
  async () => {
    balance.value = await getBalance();
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
  }
  else  {
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
  if (!balance.value) return null;
  const price = balance.value - totalPrice.value;
  return formatPrice(price);
});


</script>

<style scoped lang="scss">
</style>
