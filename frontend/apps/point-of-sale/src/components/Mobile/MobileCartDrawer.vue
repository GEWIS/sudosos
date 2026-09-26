<template>
  <Drawer
    v-model:visible="visible"
    class="mobile-cart-drawer"
    position="bottom"
    :pt="{ header: { class: 'pb-2' }, content: { class: 'flex flex-col min-h-0' } }"
  >
    <template #header>
      <div class="flex flex-col">
        <span class="text-lg font-bold">Current order</span>
        <span class="text-sm text-gray-600">for {{ displayName() }}</span>
      </div>
    </template>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <CartItemComponent v-for="item in cartItems" :key="item.product.id" :cart-product="item" />
    </div>

    <div class="shrink-0 pt-3">
      <Button
        class="w-full mb-3"
        icon="pi pi-trash"
        label="Clear order"
        outlined
        severity="danger"
        size="small"
        @click="cartStore.clearCart()"
      />
      <div class="rounded-xl bg-gray-50 px-3 py-2">
        <div class="flex justify-between items-center">
          <span class="font-semibold">Total</span>
          <span class="font-bold">€{{ formatPrice(totalPrice) }}</span>
        </div>
        <div v-if="formattedBalanceAfter != null" class="flex justify-between items-center text-sm pt-1">
          <span><i class="pi pi-exclamation-triangle text-xs" /> Debit after purchase</span>
          <span :class="{ 'text-red-600 font-semibold': balanceAfter! < 0 }">€{{ formattedBalanceAfter }}</span>
        </div>
      </div>
      <Button
        class="checkout w-full mt-3 py-3 text-lg font-semibold border-0"
        :class="{ countdown: flow.checkingOut.value }"
        :label="String(flow.checkoutText.value)"
        @click="checkout"
      />
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/FormatUtils';
import CartItemComponent from '@/components/Cart/CartItemComponent.vue';
import { useCartTransactions } from '@/composables/useCartTransactions';
import type { CheckoutFlow } from '@/composables/useCheckoutFlow';

defineProps<{
  flow: CheckoutFlow;
}>();

const emit = defineEmits<{
  checkout: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const cartStore = useCartStore();
const { displayName } = useCartTransactions();

const cartItems = computed(() => cartStore.getProducts);
const totalPrice = computed(() => cartStore.getTotalPrice);

const balanceAfter = computed(() => {
  if (cartStore.buyerBalance == null) return null;
  return cartStore.buyerBalance.amount - totalPrice.value;
});

const formattedBalanceAfter = computed(() => (balanceAfter.value == null ? null : formatPrice(balanceAfter.value)));

// Close the sheet so the countdown on the buy bar is visible.
const checkout = () => {
  visible.value = false;
  emit('checkout');
};

watch(
  () => cartStore.cartTotalCount,
  (count) => {
    if (count === 0) visible.value = false;
  },
);
</script>

<style lang="scss">
/* Drawer is teleported to <body>, so these cannot be scoped. */
.p-drawer.mobile-cart-drawer {
  height: auto;
  max-height: 85dvh;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-cart-drawer .checkout {
  background-color: #0055fd;
  color: white;

  &.countdown {
    background-color: green;
  }
}
</style>
