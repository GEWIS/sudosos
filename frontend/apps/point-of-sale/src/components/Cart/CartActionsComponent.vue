<template>
  <Dialog
    v-model:visible="showDebtWarningDialog"
    :content-style="{ width: '35rem' }"
    :draggable="false"
    header="Warning!"
    modal
    :pt="{
      header: () => ({ class: ['dialog-header'] }),
      closeButton: () => ({ class: ['dialog-close'] }),
    }"
    @click="resetDialog"
  >
    <Message :icon="undefined" severity="warn">
      You cannot checkout as you are a user that cannot go into debt! <br />
      Please remove items or top up before you can continue.
    </Message>
  </Dialog>
  <AprilFoolsComponent
    :show="showAprilFools"
    @closed="onAprilFoolsClosed"
    @logout="logout"
    @update:show="showAprilFools = $event"
  />
  <AgeVerificationComponent
    :show="showAgeVerification"
    @confirmed="onAgeVerificationConfirmed"
    @denied="onAgeVerificationDenied"
    @update:show="showAgeVerification = $event"
  />
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
        <i class="pi pi-sign-out" style="font-size: 2rem" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { logoutService } from '@/services/logoutService';
import { useCartStore } from '@/stores/cart.store';
import { useSettingStore } from '@/stores/settings.store';
import { useCheckoutTimer } from '@/composables/useCheckoutTimer';
import { playAudio, Sound } from '@/utils/audioUtil';
import AprilFoolsComponent from '@/components/AprilFoolsComponent.vue';
import AgeVerificationComponent from '@/components/AgeVerificationComponent.vue';

const emit = defineEmits(['selectCreator']);

const settings = useSettingStore();
const cartStore = useCartStore();
const cartItems = cartStore.getProducts;
const borrelMode = computed(() => settings.isBorrelmode);
const buyer = computed(() => cartStore.getBuyer);

const {
  duration,
  checkingOut,
  checkout: checkoutWithTimer,
  stopCheckout,
  showDebtWarningDialog,
  resetDialog,
} = useCheckoutTimer(() => playAudio(Sound.CASHOUT));

const checkoutText = computed(() => {
  if (checkingOut.value) return duration.value;

  if (!buyer.value) return 'Charge someone';
  return 'Checkout';
});

const enabled = computed(() => {
  return cartItems.length > 0 && buyer.value;
});

const logout = async () => {
  stopCheckout();
  await logoutService();
};

const STEEKPROEF_CHANCE = 0.45;

const showAprilFools = ref(false);
let pendingCheckoutArgs: { onSelectCreator: () => void; isBorrelMode: boolean } | null = null;

const showAgeVerification = ref(false);
let pendingAgeVerificationArgs: { onSelectCreator: () => void; isBorrelMode: boolean } | null = null;

const proceedToCheckoutTimer = (onSelectCreator: () => void, isBorrelMode: boolean) => {
  if (settings.showAprilFools && Math.random() < STEEKPROEF_CHANCE) {
    pendingCheckoutArgs = { onSelectCreator, isBorrelMode };
    showAprilFools.value = true;
  } else {
    checkoutWithTimer(onSelectCreator, isBorrelMode);
  }
};

const onAprilFoolsClosed = () => {
  if (pendingCheckoutArgs) {
    const { onSelectCreator, isBorrelMode } = pendingCheckoutArgs;
    pendingCheckoutArgs = null;
    checkoutWithTimer(onSelectCreator, isBorrelMode);
  }
};

const onAgeVerificationConfirmed = () => {
  if (pendingAgeVerificationArgs) {
    const { onSelectCreator, isBorrelMode } = pendingAgeVerificationArgs;
    pendingAgeVerificationArgs = null;
    proceedToCheckoutTimer(onSelectCreator, isBorrelMode);
  }
};

const onAgeVerificationDenied = () => {
  cartStore.removeAlcoholicProducts();
  pendingAgeVerificationArgs = null;
};

const checkout = () => {
  if (!enabled.value) return;

  const onSelectCreator = () => emit('selectCreator');
  const isBorrelMode = borrelMode.value;

  if (checkingOut.value) {
    checkoutWithTimer(onSelectCreator, isBorrelMode);
    return;
  }

  if (settings.showAprilFools && cartStore.hasAlcoholicProducts) {
    pendingAgeVerificationArgs = { onSelectCreator, isBorrelMode };
    showAgeVerification.value = true;
  } else {
    proceedToCheckoutTimer(onSelectCreator, isBorrelMode);
  }
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
