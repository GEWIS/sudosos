<template>
  <CheckoutDialogs :flow="flow" />
  <!-- gap-6 matches the spacing justify-between happens to leave between the
       fixed-width Checkout button and the logout icon on an authenticated POS,
       so borrel mode (where Checkout is full width) looks identical. -->
  <div class="flex justify-between gap-6 w-full">
    <Button
      class="border-0 checkout font-medium rounder text-3xl"
      :class="{ countdown: checkingOut, disabled: !enabled, borrelMode }"
      @click="checkout"
    >
      {{ checkoutText }}
    </Button>
    <div class="flex justify-center items-center">
      <Button
        v-if="borrelMode"
        aria-label="Pay with card terminal"
        class="terminal p-3 text-2xl text-white flex items-center justify-center w-16 h-16"
        :disabled="!terminalEnabled || showTerminalPayment"
        @click="payWithTerminal"
      >
        <ProgressSpinner v-if="showTerminalPayment" class="button-spinner" stroke-width="4" />
        <i v-else class="pi pi-credit-card" style="font-size: 2rem" />
      </Button>
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
import CheckoutDialogs from '@/components/Cart/CheckoutDialogs.vue';
import { useCheckoutFlow } from '@/composables/useCheckoutFlow';

const emit = defineEmits(['selectCreator']);

const flow = useCheckoutFlow(() => emit('selectCreator'));
const {
  borrelMode,
  checkingOut,
  checkoutText,
  enabled,
  checkout,
  showTerminalPayment,
  terminalEnabled,
  payWithTerminal,
  logout,
} = flow;
</script>

<style scoped lang="scss">
.clear {
  color: white;
  background-color: red;
}

.terminal:disabled {
  background-color: grey;
  border-color: grey;
  opacity: 1;
  cursor: not-allowed;
}

.button-spinner {
  width: 30px;
  height: 30px;
  --p-progressspinner-color-one: white;
  --p-progressspinner-color-two: white;
  --p-progressspinner-color-three: white;
  --p-progressspinner-color-four: white;
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
</style>
