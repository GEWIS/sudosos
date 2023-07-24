<template>
  <div class="cart">
    <div class="user-info">
      <p> Current order for </p>
      <div class="user-button">
        <font-awesome-icon icon="fa-solid fa-user" class="user-icon"/>
        {{ current?.firstName }}
      </div>
    </div>
    <div class="cart-items" v-if="!showHistory">
      <div v-for="item in cartItems" :key="item.product.id">
        <CartItemComponent :cart-product="item"/>
      </div>
    </div>
    <TransactionHistoryComponent v-else :transactions="transactions"/>
    <div class="cart-info">
      <div class="total-info">
        <div class="total-label">Total</div>
        <div class="total-price">€{{ formatPrice(totalPrice) }}</div>
      </div>
      <div class="warning-line" v-if="balance">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle"/>
        Your debit after purchase is €{{ formattedBalanceAfter }}
      </div>
    </div>
    <div class="cart-actions">
      <div class="buttons">
        <button class="checkout-button"
                :class="{'countdown': checkingOut, 'empty': cartStore.cartTotalCount === 0}"
                @click="checkout">{{ checkingOut ? duration : "CHECKOUT" }}
        </button>
        <button class="clear-button" @click="logout">
          <font-awesome-icon icon="fa-solid fa-xmark"/>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useCartStore } from '@/stores/cart.store';
import CartItemComponent from "@/components/Cart/CartItemComponent.vue";
import apiService from "@/services/ApiService";
import { formatPrice } from "@/utils/FormatUtils";
import { logoutService } from "@/services/logoutService";
import TransactionHistoryComponent
  from "@/components/Cart/TransactionHistory/TransactionHistoryComponent.vue";

const cartStore = useCartStore();
const cartItems = cartStore.getProducts;
const current = computed(() => cartStore.getBuyer);
const totalPrice = computed(() => cartStore.getTotalPrice);
const showHistory = ref(true);
const balance = ref<number | null>(null);

const transactions = ref([])
apiService.user.getUsersTransactions(cartStore.getBuyer?.id, undefined, undefined, undefined,
  undefined, undefined, undefined, undefined, 5).then((res) => {
    transactions.value.push(...res.data.records);
})
const getBalance = async () => {
  if (!cartStore.buyer) return 0;
  try {
    const response = await apiService.balance.getBalanceId(cartStore.buyer.id)
    return response.data.amount.amount;
  } catch (error) {
    return null;
  }
};

onMounted(async () => {
  balance.value = (await getBalance());
});

watch(cartItems, () => {
  showHistory.value = false;
})

watch(() => cartStore.buyer, async () => {
  balance.value = (await getBalance());
});

const formattedBalanceAfter = computed(() => {
  if (!balance.value) return null;
  const price = (balance.value - totalPrice.value);
  return formatPrice(price);
})

const duration = ref(3)
const checkingOut = ref(false);
let intervalId: number | undefined;
const checkoutTimer = () => setInterval(() => {
  duration.value -= 1;
  if (duration.value <= 0 && checkingOut.value) {
    stopCheckout(intervalId);
    cartStore.checkout();
    checkingOut.value = false;
    duration.value = 3;
  }
}, 1000);

const stopCheckout = () => {
  duration.value = 3;
  checkingOut.value = false;
  clearInterval(intervalId);
}
const logout = async () => {
  if (intervalId) stopCheckout();
  await logoutService()
};

watch(cartItems, () => {
  stopCheckout();
})

const checkout = () => {
  if (cartStore.cartTotalCount === 0) return;
  if (checkingOut.value) return stopCheckout();
  checkingOut.value = true;
  intervalId = checkoutTimer()
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
  background-color: #0055FD;
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

  &.countdown {
    background-color: green;
  }
}
</style>
