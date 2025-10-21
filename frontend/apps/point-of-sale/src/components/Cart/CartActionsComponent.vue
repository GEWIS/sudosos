<template>
  <Dialog
    v-model:visible="showDebtWarningDialog"
    :closable="true"
    :content-style="{ width: '35rem' }"
    header="Warning!"
    modal
    :pt="{
      header: () => ({ class: ['dialog-header'] }),
      closeButton: () => ({ class: ['dialog-close'] }),
    }"
    @click="resetDialog"
  >
    <Message :closable="false" :icon="undefined" severity="warn">
      You cannot checkout as you are a user that cannot go into debt! <br />
      Please remove items before you can continue.
    </Message>
  </Dialog>
  <div class="flex justify-between w-full">
    <Button
      class="border-0 checkout font-medium rounder text-3xl"
      :class="{ countdown: checkingOut, disabled: !enabled, borrelMode }"
      @click="checkout"
    >
      {{ checkoutText }}
    </Button>
    <div class="flex justify-center items-center">
      <Button
        v-if="!borrelMode"
        class="p-3 text-2xl text-white flex items-center justify-center w-16 h-16"
        @click="logout"
      >
        <i class="pi pi-times" style="font-size: 2rem" />
      </Button>
    </div>
    <audio ref="sound" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { logoutService } from '@/services/logoutService';
import { useCartStore } from '@/stores/cart.store';
import { useSettingStore } from '@/stores/settings.store';

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
const unallowedUserInDebt = computed(() => cartStore.checkUnallowedUserInDebt());
const showDebtWarning = ref(true);
const showDebtWarningDialog = computed(() => {
  return unallowedUserInDebt.value && showDebtWarning.value;
});
const resetDialog = () => {
  showDebtWarning.value = false;
};

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
  if (unallowedUserInDebt.value) return stopCheckout();

  stopCheckout();
  if (sound.value) {
    sound.value = new Audio('sounds/rct-cash.wav');
    void sound.value.play();
  }

  await cartStore.checkout();
  checkingOut.value = false;
  duration.value = 3;
  await logoutService();
};
const checkout = () => {
  if (!enabled.value) return;
  if (unallowedUserInDebt.value) return stopCheckout();

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
  }
}
.dialog-header {
  background: var(--accent-color) !important;
  color: white !important;
}

.dialog-close {
  color: white !important;
}
</style>
