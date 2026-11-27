<template>
  <div class="mobile-pos flex flex-col h-full min-h-0 gap-2 p-2">
    <main class="card flex-1 min-h-0 flex flex-col p-3">
      <template v-if="tab === 'products'">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold mr-auto truncate">{{ pointOfSale?.name }}</h1>
          <MobileBuyerChipComponent @click="openBuyerSheet(false)" />
        </div>
        <ActivityComponent class="text-sm pt-1" />
        <div class="flex-1 min-h-0">
          <PointOfSaleDisplayComponent compact :point-of-sale="pointOfSale" />
        </div>
      </template>
      <MobileHistoryTabComponent v-else-if="tab === 'history'" />
      <MobileTillTabComponent v-else :serving-as="servingAs" @change-serving="servingOpen = true" />
    </main>

    <template v-if="tab === 'products'">
      <MobileUndoSnackbarComponent
        v-if="borrelMode && checkout.pending.value"
        :order="checkout.pending.value"
        :progress="checkout.progress.value"
        :seconds-left="checkout.secondsLeft.value"
        :sending="checkout.sending.value"
        @undo="checkout.undo"
      />
      <div v-if="borrelMode" class="card flex items-center gap-2 px-3 py-2">
        <button class="text-left mr-auto truncate" type="button" @click="servingOpen = true">
          Serving as <b>{{ servingAs?.firstName ?? 'nobody yet' }}</b>
        </button>
        <button
          v-if="lastOrder && cartStore.cartTotalCount === 0"
          class="font-semibold"
          type="button"
          @click="repeatLastOrder"
        >
          <i class="pi pi-replay" /> Same again
        </button>
      </div>
      <button v-if="cartStore.cartTotalCount > 0" class="cart-bar" type="button" @click="cartOpen = true">
        <span :key="cartStore.cartTotalCount" class="count">{{ itemCountLabel }}</span>
        <span class="flex-1">Review cart</span>
        <span>€{{ formatPrice(cartStore.getTotalPrice) }}</span>
        <i class="pi pi-chevron-up" />
      </button>
    </template>

    <nav class="card tab-bar">
      <button
        v-for="item in tabs"
        :key="item.key"
        class="tab"
        :class="{ active: tab === item.key }"
        type="button"
        @click="tab = item.key"
      >
        <i class="pi text-xl" :class="item.icon" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <MobileCartSheetComponent
      v-model:visible="cartOpen"
      @pay="pay"
      @pay-card="payWithCard"
      @pick-buyer="openBuyerSheet(true)"
    />
    <MobileBuyerSheetComponent v-model:visible="buyerOpen" />
    <MobileServingSheetComponent
      v-if="borrelMode"
      v-model:serving-as="servingAs"
      v-model:visible="servingOpen"
      @selected="onServingSelected"
    />
    <TerminalPaymentModal :show="showTerminalPayment" @update:show="showTerminalPayment = $event" />
    <MobileReceiptComponent
      v-if="!borrelMode && checkout.pending.value"
      :order="checkout.pending.value"
      :progress="checkout.progress.value"
      :seconds-left="checkout.secondsLeft.value"
      :sending="checkout.sending.value"
      @undo="checkout.undo"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { PointOfSaleWithContainersResponse } from '@gewis/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useCartStore } from '@/stores/cart.store';
import { PointOfSaleAssociate, usePointOfSaleStore } from '@/stores/pos.store';
import { useSettingStore } from '@/stores/settings.store';
import { PlacedOrder, useDelayedCheckout } from '@/composables/useDelayedCheckout';
import { logoutService } from '@/services/logoutService';
import { formatPrice } from '@/utils/FormatUtils';
import ActivityComponent from '@/components/ActivityComponent.vue';
import PointOfSaleDisplayComponent from '@/components/PointOfSaleDisplay/PointOfSaleDisplayComponent.vue';
import TerminalPaymentModal from '@/components/Cart/TerminalPaymentModal.vue';
import MobileBuyerChipComponent from '@/components/Mobile/MobileBuyerChipComponent.vue';
import MobileBuyerSheetComponent from '@/components/Mobile/MobileBuyerSheetComponent.vue';
import MobileCartSheetComponent from '@/components/Mobile/MobileCartSheetComponent.vue';
import MobileHistoryTabComponent from '@/components/Mobile/MobileHistoryTabComponent.vue';
import MobileReceiptComponent from '@/components/Mobile/MobileReceiptComponent.vue';
import MobileServingSheetComponent from '@/components/Mobile/MobileServingSheetComponent.vue';
import MobileTillTabComponent from '@/components/Mobile/MobileTillTabComponent.vue';
import MobileUndoSnackbarComponent from '@/components/Mobile/MobileUndoSnackbarComponent.vue';

defineProps<{
  pointOfSale?: PointOfSaleWithContainersResponse;
}>();

type Tab = 'products' | 'history' | 'till';

const cartStore = useCartStore();
const authStore = useAuthStore();
const posStore = usePointOfSaleStore();
const settings = useSettingStore();

// Borrel mode starts every order without a buyer. An authenticated POS charges
// whoever logged in, unless the seller picks someone else via the buyer chip.
const borrelMode = computed(() => settings.isBorrelmode);

const tab = ref<Tab>('products');
const tabs = computed<{ key: Tab; label: string; icon: string }[]>(() => [
  { key: 'products', label: 'Products', icon: 'pi-th-large' },
  borrelMode.value
    ? { key: 'history', label: 'Feed', icon: 'pi-list' }
    : { key: 'history', label: 'History', icon: 'pi-history' },
  { key: 'till', label: 'Till', icon: 'pi-shop' },
]);

const cartOpen = ref(false);
const buyerOpen = ref(false);
const servingOpen = ref(false);
const showTerminalPayment = ref(false);

const itemCountLabel = computed(() => {
  const count = cartStore.cartTotalCount;
  return `${count} ${count === 1 ? 'item' : 'items'}`;
});

// Picking a buyer from the cart sheet returns to the cart afterwards.
let returnToCart = false;
const openBuyerSheet = (fromCart: boolean) => {
  returnToCart = fromCart;
  cartOpen.value = false;
  buyerOpen.value = true;
};
watch(buyerOpen, (open) => {
  if (open || !returnToCart) return;
  returnToCart = false;
  cartOpen.value = cartStore.cartTotalCount > 0;
});

// Borrel: who serves is chosen once per shift and books every sale until
// switched. It defaults to the logged-in member when they belong to the till.
const servingAs = ref<PointOfSaleAssociate | null>(null);
let payAfterServing = false;
onMounted(() => {
  if (!borrelMode.value) return;
  // Logging in makes the operator the buyer; at a borrel they serve rather than
  // pay, so every order starts without a buyer unless one is locked in.
  void cartStore.setBuyer(cartStore.lockedIn);
  const pos = posStore.getPos;
  if (pos && posStore.getPointOfSaleAssociates === null) void posStore.fetchPointOfSaleAssociates(pos.id);
});
watch(
  () => posStore.getPointOfSaleAssociates,
  (associates) => {
    if (servingAs.value || !associates) return;
    servingAs.value = associates.find((associate) => associate.id === authStore.getUser?.id) ?? null;
  },
  { immediate: true },
);

// Borrel: offer the previous order again for the next round.
const lastOrder = ref<PlacedOrder | null>(null);
const repeatLastOrder = () => {
  lastOrder.value?.products.forEach((product) => cartStore.addToCart({ ...product }));
};

const checkout = useDelayedCheckout(async (order) => {
  if (borrelMode.value) {
    lastOrder.value = order;
    return;
  }
  await logoutService();
});

const placeOrder = () => {
  const createdBy = borrelMode.value ? servingAs.value?.id : authStore.getUser?.id;
  if (createdBy === undefined || !checkout.place(createdBy)) return;
  cartOpen.value = false;
  // Borrel: the till is ready for the next guest straight away.
  if (borrelMode.value) void cartStore.setBuyer(cartStore.lockedIn);
};

const pay = () => {
  if (borrelMode.value && !servingAs.value) {
    payAfterServing = true;
    cartOpen.value = false;
    servingOpen.value = true;
    return;
  }
  placeOrder();
};

const onServingSelected = () => {
  if (!payAfterServing) return;
  payAfterServing = false;
  placeOrder();
};

const payWithCard = () => {
  cartOpen.value = false;
  showTerminalPayment.value = true;
};
</script>

<style scoped lang="scss">
.card {
  border-radius: var(--p-button-border-radius);
  background: #ffffffee;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.cart-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: var(--p-button-border-radius);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-size: 1.125rem;
  font-weight: 600;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2);

  .count {
    padding: 0.1rem 0.5rem;
    border-radius: var(--p-button-border-radius);
    background: rgb(255 255 255 / 0.2);
    font-size: 0.875rem;
    animation: bump 0.3s ease-out;
  }
}

@keyframes bump {
  50% {
    transform: scale(1.2);
  }
}

.tab-bar {
  display: flex;
  padding: 0.25rem;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.4rem 0;
  border-radius: var(--p-button-border-radius);
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.55;

  &.active {
    opacity: 1;
    color: var(--p-primary-color);
    background: color-mix(in srgb, var(--p-primary-color) 8%, transparent);
  }
}

// The reused kiosk product display is sized for a landscape touchscreen; these
// overrides only apply inside this phone layout.
.mobile-pos {
  // Phones scroll by touch: drop the wide kiosk scrollbar and its gutter.
  :deep(.products-scroll-panel .p-scrollpanel-wrapper) {
    border-right: 0;
  }

  :deep(.products-scroll-panel .p-scrollpanel-bar) {
    display: none;
  }

  :deep(.mr-6) {
    margin-right: 0;
  }

  // Category buttons become a horizontally scrolling row of chips.
  :deep(.header) {
    min-height: 3.25rem;
  }

  :deep(.header .flex-wrap) {
    flex-wrap: nowrap;
    gap: 0.5rem;
    overflow-x: auto;

    > * {
      flex-shrink: 0;
    }

    .p-button {
      padding: 0.4rem 0.9rem;
      font-size: 1rem;
    }
  }

  :deep(.header .pi-search),
  :deep(.header .pi-times) {
    font-size: 1.25rem !important;
  }

  :deep(#searchInput) {
    flex: 1;
    min-width: 0;
  }
}
</style>
