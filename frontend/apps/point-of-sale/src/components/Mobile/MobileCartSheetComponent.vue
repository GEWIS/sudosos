<template>
  <MobileSheetComponent v-model:visible="visible">
    <template #header>
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-bold mr-auto whitespace-nowrap">Order for</h2>
        <MobileBuyerChipComponent @click="emit('pickBuyer')" />
        <Button
          v-if="settings.isBorrelmode && buyer"
          :aria-label="isLocked ? 'Unlock buyer' : 'Keep this buyer for next orders'"
          class="lock-button"
          :outlined="!isLocked"
          @click="toggleLock"
        >
          <i class="pi" :class="isLocked ? 'pi-lock' : 'pi-lock-open'" />
        </Button>
      </div>
    </template>

    <div class="flex flex-col gap-3 pb-2">
      <div v-if="underageWithAlcohol" class="notice warn">
        <i class="pi pi-exclamation-triangle" />
        {{ buyer?.firstName }} is under 18: remove the alcoholic drinks.
      </div>

      <div v-if="cartStore.cartTotalCount === 0" class="py-6 text-center opacity-60">Your cart is empty</div>
      <div v-else class="cart-lines">
        <CartItemComponent v-for="item in cartStore.getProducts" :key="cartKey(item)" :cart-product="item" />
      </div>

      <!-- Inline debt guard: what is missing and how to fix it, instead of a blocking dialog. -->
      <div v-if="shortBy > 0" class="notice warn debt-guard">
        <div class="font-bold text-lg"><i class="pi pi-exclamation-triangle" /> €{{ formatPrice(shortBy) }} short</div>
        <div>
          This account cannot go into debt. Current balance is
          <b>{{ formatDineroObjectToString(cartStore.buyerBalance) }}</b>.
        </div>
        <div class="meter"><span :style="{ width: `${coverage * 100}%` }" /></div>
        <div class="flex gap-2 flex-wrap">
          <Button
            v-if="lastLine"
            class="guard-button"
            outlined
            severity="warn"
            @click="cartStore.removeFromCart(lastLine)"
          >
            Remove 1× {{ lastLine.product.name }}
          </Button>
          <Button class="guard-button" severity="warn" @click="showTopUp = !showTopUp">Top up</Button>
        </div>
        <div v-if="showTopUp" class="flex flex-col items-center gap-1 pt-1">
          <img alt="SudoSOS QR code" class="w-40" src="@/assets/sudosos-qr.png" />
          <span class="text-sm">Scan to top up your balance</span>
        </div>
      </div>

      <div v-if="cartStore.cartTotalCount > 0" class="totals">
        <div v-if="balanceAfter !== null" class="flex justify-between text-sm">
          <span>Balance after</span>
          <span :class="{ negative: balanceAfter < 0 }">€{{ formatPrice(balanceAfter) }}</span>
        </div>
        <div class="flex justify-between items-baseline">
          <span class="font-semibold text-lg">Total</span>
          <span class="font-bold text-2xl">€{{ formatPrice(cartStore.getTotalPrice) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <Button
          v-if="settings.isBorrelmode && !buyer"
          class="pay-button"
          :disabled="cartStore.cartTotalCount === 0"
          @click="emit('pickBuyer')"
        >
          Choose who pays
        </Button>
        <Button v-else class="pay-button" :disabled="!canPay" @click="emit('pay')">
          Pay €{{ formatPrice(cartStore.getTotalPrice) }}
        </Button>
        <Button
          v-if="settings.isBorrelmode"
          aria-label="Pay with card terminal"
          class="card-button"
          :disabled="cartStore.cartTotalCount === 0 || !!buyer"
          outlined
          @click="emit('payCard')"
        >
          <i class="pi pi-credit-card text-2xl" />
        </Button>
      </div>
    </template>
  </MobileSheetComponent>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MobileSheetComponent from '@/components/Mobile/MobileSheetComponent.vue';
import MobileBuyerChipComponent from '@/components/Mobile/MobileBuyerChipComponent.vue';
import CartItemComponent from '@/components/Cart/CartItemComponent.vue';
import { CartProduct, useCartStore } from '@/stores/cart.store';
import { useSettingStore } from '@/stores/settings.store';
import { formatDineroObjectToString, formatPrice } from '@/utils/FormatUtils';

const visible = defineModel<boolean>('visible', { required: true });
const emit = defineEmits<{ pay: []; pickBuyer: []; payCard: [] }>();

const cartStore = useCartStore();
const settings = useSettingStore();

const buyer = computed(() => cartStore.getBuyer);
const isLocked = computed(() => !!buyer.value && cartStore.lockedIn?.id === buyer.value.id);
const toggleLock = () => cartStore.setLockedIn(isLocked.value ? null : buyer.value);

const cartKey = (item: CartProduct) => `${item.container.id}-${item.product.id}-${item.product.revision}`;
const lastLine = computed(() => cartStore.getProducts[cartStore.getProducts.length - 1]);

const balanceAfter = computed(() =>
  cartStore.buyerBalance ? cartStore.buyerBalance.amount - cartStore.getTotalPrice : null,
);
const shortBy = computed(() =>
  cartStore.checkUnallowedUserInDebt() && balanceAfter.value !== null ? -balanceAfter.value : 0,
);
const coverage = computed(() => {
  const balance = Math.max(cartStore.buyerBalance?.amount ?? 0, 0);
  return cartStore.getTotalPrice > 0 ? Math.min(balance / cartStore.getTotalPrice, 1) : 1;
});
const showTopUp = ref(false);
watch(shortBy, (value) => {
  if (value === 0) showTopUp.value = false;
});

const underageWithAlcohol = computed(() => buyer.value?.ofAge === false && cartStore.hasAlcoholicProducts);

const canPay = computed(
  () => !!buyer.value && cartStore.cartTotalCount > 0 && shortBy.value === 0 && !underageWithAlcohol.value,
);
</script>

<style scoped lang="scss">
.lock-button {
  width: 2.75rem;
  height: 2.75rem;
}

.cart-lines {
  max-height: 40dvh;
  overflow-y: auto;
}

.notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: var(--p-button-border-radius);

  &.warn {
    border: 1px solid #fcd34d;
    background: #fffbeb;
    color: #92400e;
  }

  &.debt-guard {
    flex-direction: column;
    align-items: stretch;
  }
}

.meter {
  height: 0.4rem;
  border-radius: var(--p-button-border-radius);
  background: #fde68a;
  overflow: hidden;

  > span {
    display: block;
    height: 100%;
    background: #d97706;
  }
}

.guard-button {
  padding: 0.35rem 0.75rem;
}

.totals {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--p-surface-200);
}

.negative {
  color: var(--p-primary-color);
  font-weight: 600;
}

// SudoSOS checkout blue, as on the kiosk.
.pay-button {
  flex: 1;
  padding: 0.9rem;
  border: 0;
  background: #0055fd;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;

  &:disabled {
    background: var(--p-surface-400);
    opacity: 1;
  }
}

.card-button {
  width: 3.75rem;
}
</style>
