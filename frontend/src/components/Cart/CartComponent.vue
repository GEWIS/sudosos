<template>
  <div class="flex-column h-100">
    <div class="flex-container flex-row-reverse justify-content-between">
      <div class="c-btn active square fs-4 px-3 py-1" @click="selectUser">
        <font-awesome-icon icon="fa-solid fa-user" class="pe-2" />
        {{ displayName() }}
      </div>
      <p class="fw-bolder font-size-lg" v-if="isOwnBuyer">Current order for</p>
    </div>
    <div class="overflow-y-auto flex-grow-1 my-2" v-if="!showHistory">
      <div v-for="item in cartItems" :key="item.product.id">
        <CartItemComponent :cart-product="item" />
      </div>
    </div>
    <TransactionHistoryComponent v-else :transactions="transactions" />
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
      <div class="d-flex justify-content-between w-100">
        <button
          class="c-btn rounder fw-medium checkout fs-3"
          :class="{ countdown: checkingOut, empty: cartStore.cartTotalCount === 0, borrelMode }"
          @click="checkout"
        >
          {{ checkingOut ? duration : 'CHECKOUT' }}
        </button>
        <button class="c-btn clear icon-larger rounded-circle" @click="logout" v-if="!borrelMode">
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useCartStore } from '@/stores/cart.store';
import CartItemComponent from '@/components/Cart/CartItemComponent.vue';
import apiService from '@/services/ApiService';
import { formatPrice } from '@/utils/FormatUtils';
import { logoutService } from '@/services/logoutService';
import TransactionHistoryComponent from
    '@/components/Cart/TransactionHistory/TransactionHistoryComponent.vue';
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { BaseTransactionResponse, BaseUserResponse } from "@sudosos/sudosos-client";
import { usePointOfSaleStore } from "@/stores/pos.store";

const cartStore = useCartStore();
const authStore = useAuthStore();
const posStore = usePointOfSaleStore();

const cartItems = cartStore.getProducts;
const current = computed(() => cartStore.getBuyer);
const totalPrice = computed(() => cartStore.getTotalPrice);
const showHistory = ref(true);
const balance = ref<number | null>(null);

const borrelMode = computed<boolean>(() => {
  if (!posStore.getPos) return false;
  return !posStore.getPos.useAuthentication;
});

const posOwner = computed<BaseUserResponse | undefined>(() => {
  if (!posStore.getPos) return undefined;
  return posStore.getPos.owner;
});

const transactions = ref<BaseTransactionResponse[]>([]);

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
  if (isOwnBuyer.value) {
    return current.value?.firstName;
  } else {
    return `${current.value?.firstName} ${current.value?.lastName}`;
  }
};

onMounted(async () => {
  balance.value = await getBalance();
});

watch(cartItems, () => {
  showHistory.value = false;
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

const duration = ref(3);
const checkingOut = ref(false);
let intervalId: number | undefined;
const checkoutTimer = () =>
  setInterval(async () => {
    duration.value -= 1;
    if (duration.value <= 0 && checkingOut.value) {
      await finalizeCheckout();
    }
  }, 1000);

const stopCheckout = () => {
  duration.value = 3;
  checkingOut.value = false;
  clearInterval(intervalId);
};
const logout = async () => {
  if (intervalId) stopCheckout();
  await logoutService();
};

watch(cartItems, () => {
  stopCheckout();
});

const finalizeCheckout = async () => {
  stopCheckout();
  await cartStore.checkout();
  checkingOut.value = false;
  duration.value = 3;
  // TODO only logout if not authenticated pos.
  await logoutService();
};
const checkout = async () => {
  if (cartStore.cartTotalCount === 0) return;
  if (checkingOut.value) return stopCheckout();
  checkingOut.value = true;
  intervalId = checkoutTimer();
};
</script>

<style scoped lang="scss">
.clear {
  color: white;
  background-color: red;
  height: $cart-logout-size;
  width: $cart-logout-size;
}

.checkout {
  background-color: #0055fd;
  width: 262px;
  color: white;

  &.borrelMode {
    width: 100%;
  }

  &.countdown {
    background-color: green;
  }

  &.empty {
    background-color: grey;
    opacity: 0.5;
  }
}
</style>
