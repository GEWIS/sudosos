<template>
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
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref, watch } from "vue";
import { logoutService } from "@/services/logoutService";
import { useCartStore } from "@/stores/cart.store";
import { useSettingStore } from "@/stores/settings.store";

const settings = useSettingStore();

const cartStore = useCartStore();
const cartItems = cartStore.getProducts;
const borrelMode = computed(() => settings.isBorrelmode);

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
