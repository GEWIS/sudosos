<template>
  <div class="cart">
    <div class="user-info">
      {{ current.firstName }}
    </div>
    <div class="cart-items">
      <div v-for="item in cartItems" :key="item">
        <CartItemComponent :cart-product="item" />
      </div>
    </div>
    <div class="cart-info">
      <div class="total-info">
        <div class="total-label">Total</div>
        <div class="total-price">€{{ getTotalPrice() }}</div>
      </div>
      <div class="warning-line" v-if="balance">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle"/> Your debit after purchase is €{{ formattedBalanceAfter }}
      </div>
    </div>
    <div class="cart-actions">
      <div class="buttons">
        <button class="checkout-button" @click="checkout">CHECKOUT</button>
        <button class="clear-button" @click="clearCart">
          <font-awesome-icon icon="fa-solid fa-xmark"/>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useCartStore } from '@/stores/cart.store';
import CartItemComponent from "@/components/CartItemComponent.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useUserStore} from "@/stores/user.store";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import ApiService from "@/services/ApiService";

const cartStore = useCartStore();
const userStore = useUserStore();
const cartItems = cartStore.getProducts;
const cartTotalCount = computed( () => cartStore.cartTotalCount);
const current = computed( () => cartStore.getBuyer);
const totalPrice = computed(() => cartStore.getTotalPrice);

const balance = ref<number | null>(null);

const getBalance = async () => {
  if (!cartStore.buyer) return 0;
  try {
    const response = await ApiService.balance.getBalanceId(cartStore.buyer.id);
    return response.data.amount.amount;
  } catch (error) {
    return null;
  }
};

onMounted(async () => {
  balance.value = (await getBalance());
});

watch(() => cartStore.buyer, async () => {
  balance.value = (await getBalance());
});


const formattedBalanceAfter = computed(() => {
  return ((balance.value - totalPrice.value) / 100).toFixed(2);
})
const getTotalPrice = () => {
  return (totalPrice.value / 100).toFixed(2);
};

const clearCart = () => {
  cartStore.clearCart();
};

const checkout = () => {
  cartStore.checkout();
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
  margin-right:10px;
  padding-left: 15px;
  padding-right: 20px;
  padding-bottom: 10px;
  padding-top: 10px;
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
  color: #888;
}

.cart {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-info {
  /* Styles for user info */
}

.cart-items {
  flex-grow: 1;
  overflow-y: auto;
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
  font-size: 27px;
  border: none;
  border-radius: 50px;
  margin-right: 10px;
  padding-left: 55px;
  padding-right: 55px;
  padding-top: 15px;
  padding-bottom: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}
</style>
