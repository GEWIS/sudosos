<template>
  <MobileCartDrawer v-model:visible="showCartDrawer" :flow="flow" @checkout="onCheckout" />

  <Transition name="slide-up">
    <div
      v-if="cartStore.cartTotalCount > 0"
      class="absolute left-3 right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 flex items-stretch gap-2 rounded-2xl bg-white p-2 shadow-lg border border-gray-200"
    >
      <button
        aria-label="Review order"
        class="flex flex-1 min-w-0 items-center gap-2 rounded-xl px-2 text-left"
        @click="showCartDrawer = true"
      >
        <span class="relative">
          <i class="pi pi-shopping-cart text-2xl text-primary" />
          <span
            class="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-contrast text-xs font-bold flex items-center justify-center"
          >
            {{ cartStore.cartTotalCount }}
          </span>
        </span>
        <span class="ml-3 flex flex-col leading-tight min-w-0">
          <span class="font-bold">€{{ formatPrice(cartStore.getTotalPrice) }}</span>
          <span class="text-xs text-gray-500 truncate">Tap to review</span>
        </span>
      </button>

      <Button
        v-if="flow.borrelMode.value"
        aria-label="Pay with card terminal"
        class="terminal w-12 shrink-0"
        :disabled="!flow.terminalEnabled.value || flow.showTerminalPayment.value"
        @click="flow.payWithTerminal"
      >
        <ProgressSpinner v-if="flow.showTerminalPayment.value" class="button-spinner" stroke-width="4" />
        <i v-else class="pi pi-credit-card text-xl" />
      </Button>

      <Button
        class="checkout shrink-0 min-w-32 px-4 text-lg font-semibold border-0"
        :class="{ countdown: flow.checkingOut.value }"
        @click="onCheckout"
      >
        {{ flow.checkoutText.value }}
      </Button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/FormatUtils';
import type { CheckoutFlow } from '@/composables/useCheckoutFlow';
import MobileCartDrawer from '@/components/Mobile/MobileCartDrawer.vue';

const props = defineProps<{
  flow: CheckoutFlow;
}>();

const emit = defineEmits<{
  selectUser: [];
}>();

const cartStore = useCartStore();
const showCartDrawer = ref(false);

// Without a buyer the kiosk shows a disabled "Charge someone" button. On a
// phone there is no cart column to pick the buyer from, so jump to the search.
const onCheckout = () => {
  if (!props.flow.buyer.value) {
    emit('selectUser');
    return;
  }
  props.flow.checkout();
};
</script>

<style scoped lang="scss">
.checkout {
  background-color: var(--pos-checkout-color);
  color: white;

  &.countdown {
    background-color: var(--pos-checkout-countdown-color);
  }
}

.terminal:disabled {
  background-color: grey;
  border-color: grey;
  opacity: 1;
}

.button-spinner {
  width: 24px;
  height: 24px;
  --p-progressspinner-color-one: white;
  --p-progressspinner-color-two: white;
  --p-progressspinner-color-three: white;
  --p-progressspinner-color-four: white;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.2s ease-out,
    opacity 0.2s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(120%);
  opacity: 0;
}
</style>
