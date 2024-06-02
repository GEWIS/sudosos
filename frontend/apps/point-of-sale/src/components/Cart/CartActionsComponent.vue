<template>
  <div class="d-flex justify-content-between w-100">
    <button
        class="c-btn rounder fw-medium checkout fs-3"
        :class="{ countdown: checkingOut, disabled: !enabled, borrelMode }"
        @click="checkout"
    >
      {{ checkoutText }}
    </button>
    <button class="c-btn clear icon-larger rounded-circle" @click="logout" v-if="!borrelMode">
      <font-awesome-icon icon="fa-solid fa-xmark" />
    </button>
    <audio ref="sound"/>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref, watch } from "vue";
import { logoutService } from "@/services/logoutService";
import { useCartStore } from "@/stores/cart.store";
import { useSettingStore } from "@/stores/settings.store";

const emit = defineEmits(['selectCreator']);

const settings = useSettingStore();

const cartStore = useCartStore();
const cartItems = cartStore.getProducts;
const borrelMode = computed(() => settings.isBorrelmode);
const sound = ref<HTMLAudioElement | null>(null);

const buyer = computed(() => cartStore.getBuyer);

const checkoutText = computed(() => {
  if (checkingOut.value) return duration.value;

  if (!buyer.value) return 'Charge someone';
  return 'Checkout';
});

const enabled = computed(() => {
  return cartItems.length > 0 && buyer.value;
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
  if (sound.value) {
    sound.value = new Audio('sounds/rct-cash.wav');
    sound.value.play();
  }
  await cartStore.checkout();
  checkingOut.value = false;
  duration.value = 3;
  await logoutService();
};
const checkout = async () => {
  if (!enabled.value) return;


  if (borrelMode.value) {
    emit('selectCreator');
    return;
  }

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

  &.disabled {
    background-color: grey;
    opacity: 0.5;
  }
}
</style>
