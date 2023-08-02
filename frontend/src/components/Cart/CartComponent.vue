<template>
  <div class="flex-column h-100">
    <div class="flex-container flex-row-reverse justify-content-between">
      <div class="c-btn active square fs-4 px-3 py-1" @click="selectUser">
        <font-awesome-icon icon="fa-solid fa-user" class="pe-2" />
        {{ displayName() }}
      </div>
      <p class="fw-bolder font-size-lg" v-if="isOwnBuyer">Current order for</p>
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
        Your debit after purchase is €{{ formattedBalanceAfter }}
      </div>
    </div>
    <div class="flex-column mt-3">
      <div v-if="borrelMode && posOwner">
        Borrelmode active for {{ posOwner.firstName }}
      </div>
      <CartActionsComponent/>
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
import { BaseTransactionResponse, BaseUserResponse } from "@sudosos/sudosos-client";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useSettingStore } from "@/stores/settings.store";
import CartActionsComponent from "@/components/Cart/CartActionsComponent.vue";
import { computed, onMounted, ref, watch } from "vue";

const cartStore = useCartStore();
const authStore = useAuthStore();
const posStore = usePointOfSaleStore();
const settings = useSettingStore();

const cartItems = cartStore.getProducts;
const current = cartStore.getBuyer;
const totalPrice = computed(() => cartStore.getTotalPrice);
const shouldShowTransactions = computed(() => settings.showUsersRecentTransactions);
const showHistory = ref(true);
const balance = ref<number | null>(null);

const borrelMode = settings.isBorrelmode;
const posOwner = computed<BaseUserResponse | undefined>(() => {
  if (!posStore.getPos) return undefined;
  return posStore.getPos.owner;
});

const transactions = ref<BaseTransactionResponse[]>([]);

const getUserRecentTransactions = () => {
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
  return current?.id === authStore.user.id;
});
const displayName = () => {
  if (isOwnBuyer.value) {
    return current?.firstName;
  } else {
    return `${current?.firstName} ${current?.lastName}`;
  }
};

onMounted(async () => {
  balance.value = await getBalance();
  if (shouldShowTransactions.value) getUserRecentTransactions();
});

watch(cartItems, () => {
  showHistory.value = false;
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

const emit = defineEmits(['selectUser']);
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
