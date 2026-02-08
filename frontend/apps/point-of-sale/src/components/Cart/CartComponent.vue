<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-row flex-wrap justify-between items-center">
      <p class="text-accent font-bold text-lg mb-0">Current order for</p>
      <Button class="px-5 py-2 square rounded-lg text-2xl" @click="selectUser">
        <i class="pi pi-user pr-2" style="font-size: 1.5rem" />
        {{ displayName() }}
      </Button>
      <Button
        v-if="showLock()"
        class="border-0 checkout font-medium rounder text-3xl"
        :class="{ disabled: disabledLock, active: lockedIn }"
        @click="lockUser"
      >
        <i class="text-4xl" :class="lockIcon" />
      </Button>
      <span v-if="!isOfAge()" class="flex items-center justify-end pt-1">
        <i class="pi pi-info-circle pr-2" />
        This user is underage.
      </span>
    </div>
    <div v-if="!shouldShowTransactions || !showHistory" class="flex-col flex-grow-1 gap-2 mt-4 overflow-y-auto">
      <div v-for="item in cartItems" :key="item.product.id">
        <CartItemComponent :cart-product="item" />
      </div>
    </div>
    <TransactionHistoryComponent
      v-else-if="shouldShowTransactions"
      :open-transaction-id="openTransactionId"
      :transactions="transactions"
    />
    <div class="bg-white rounded-xl font-size-lg mt-3 px-3 py-2 shadow-sm">
      <div class="flex justify-between items-center w-full">
        <div class="font-semibold">Total</div>
        <div class="font-bold font-size-lg">€{{ formatPrice(totalPrice) }}</div>
      </div>
      <div v-if="cartStore.buyerBalance != null" class="flex justify-between items-center font-size-md pt-2">
        <span><i class="pi pi-exclamation-triangle" /> Debit after purchase: </span>
        <span>€{{ formattedBalanceAfter }}</span>
      </div>
    </div>
    <div class="flex-col mt-3">
      <CartActionsComponent @select-creator="emit('selectCreator')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { StoreGeneric, storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cart.store';
import CartItemComponent from '@/components/Cart/CartItemComponent.vue';
import { formatPrice } from '@/utils/FormatUtils';
import TransactionHistoryComponent from '@/components/Cart/TransactionHistory/TransactionHistoryComponent.vue';
import CartActionsComponent from '@/components/Cart/CartActionsComponent.vue';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useCartTransactions } from '@/composables/useCartTransactions';

const cartStore = useCartStore();
const posStore = usePointOfSaleStore();

const cartItems = computed(() => cartStore.getProducts);
const totalPrice = computed(() => cartStore.getTotalPrice);
const showHistory = ref(true);

const { pointOfSale } = storeToRefs(posStore as StoreGeneric);
const { lockedIn } = storeToRefs(cartStore as StoreGeneric);

const {
  transactions,
  openTransactionId,
  shouldShowTransactions,
  loadTransactions,
  displayName,
  isOfAge,
  lockUser,
  showLock,
} = useCartTransactions(pointOfSale);

const lockIcon = computed(() => {
  return cartStore.lockedIn ? 'pi pi-lock' : 'pi pi-unlock';
});

const disabledLock = computed(() => {
  if (!lockedIn) return true;
  return cartStore.getBuyer?.id !== lockedIn.value?.id;
});

onMounted(async () => {
  transactions.value.splice(0);
  if (shouldShowTransactions.value) await loadTransactions();
});

watch(cartItems, () => {
  // if (!settings.isBorrelmode) showHistory.value = false;
});

watch(shouldShowTransactions, async () => {
  if (shouldShowTransactions.value) await loadTransactions();
});

watch(
  () => cartStore.buyer,
  async () => {
    if (shouldShowTransactions.value) await loadTransactions();
  },
);

const emit = defineEmits(['selectUser', 'selectCreator']);
const selectUser = () => {
  emit('selectUser');
};

const formattedBalanceAfter = computed(() => {
  if (cartStore.buyerBalance == null) return null;
  const price = cartStore.buyerBalance.amount - totalPrice.value;
  return formatPrice(price);
});
</script>

<style scoped lang="scss">
.checkout {
  &.disabled {
    background-color: #6b7280 !important; /* grey-500 */
    opacity: 0.6 !important;
    color: #9ca3af !important; /* grey-400 */
    cursor: not-allowed !important;

    &:hover {
      background-color: #6b7280 !important; /* Keep grey on hover */
      opacity: 0.6 !important;
    }
  }

  &.active {
    background-color: var(--p-primary-color) !important;
    color: white !important;
  }
}
</style>
