<template>
  <div class="cart">
    <div class="user-info">
      <div class="user-button" @click="selectUser">
        <font-awesome-icon icon="fa-solid fa-user" class="user-icon" />
        {{ displayName() }}
      </div>
      <p v-if="isOwnBuyer">Current order for</p>
    </div>
    <div class="cart-items" v-if="!showHistory">
      <div v-for="item in cartItems" :key="item.product.id">
        <CartItemComponent :cart-product="item" />
      </div>
    </div>
    <TransactionHistoryComponent v-else :transactions="transactions" />
    <div class="cart-info">
      <div class="total-info">
        <div class="total-label">Total</div>
        <div class="total-price">€{{ formatPrice(totalPrice) }}</div>
      </div>
      <div class="warning-line" v-if="balance">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
        Your debit after purchase is €{{ formattedBalanceAfter }}
      </div>
    </div>
    <div class="cart-actions">
      <div v-if="borrelMode && posOwner">
        Borrelmode active for {{ posOwner.firstName }}
      </div>
      <div class="buttons">
        <button
          class="checkout-button"
          :class="{ countdown: checkingOut, empty: cartStore.cartTotalCount === 0, borrelMode }"
          @click="checkout"
        >
          {{ checkingOut ? duration : 'CHECKOUT' }}
        </button>
        <button class="clear-button" @click="logout" v-if="!borrelMode">
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

<style scoped>
.cart-info {
  display: flex;
  justify-content: space-between;
  background-color: white;
  margin-bottom: 10px;
  font-size: 20px;
  border-radius: 15px;
  flex-direction: column;
  margin-right: 10px;
  padding: 10px 20px 10px 15px;
}

.total-info {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.total-label {
  font-weight: bold;
}

.total-price {
  font-weight: 900;
  font-size: 21px;
}

.warning-line {
  margin-top: 10px;
  font-size: 14px;
  color: var(--accent-color);
}

.cart {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-info {
  justify-content: space-between;
  align-items: center;
  flex-direction: row-reverse;
  display: flex;

  > p {
    font-size: 20px;
    font-weight: bolder;
  }
}

.user-icon {
  padding-right: 5px;
}

.user-button {
  background-color: var(--accent-color);
  color: white;
  border-radius: 15px;
  font-size: 25px;
  padding: 5px 20px 5px 15px;
}

.cart-items {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  margin-top: 20px;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 25px;
}

.buttons {
  display: flex;
  width: 100%;
  gap: 10px;
}

.clear-button {
  background-color: red;
  color: white;
  font-size: 50px;
  height: 75px;
  width: 75px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.checkout-button {
  background-color: #0055fd;
  font-weight: 500;
  color: white;
  width: 262px;
  font-size: 27px;
  border: none;
  border-radius: 50px;
  margin-right: 10px;
  padding: 15px 55px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;

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
