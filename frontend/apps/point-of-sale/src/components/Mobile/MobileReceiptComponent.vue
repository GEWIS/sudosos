<template>
  <div class="fixed inset-0 z-[1100] flex p-2 bg-black/40">
    <div class="receipt flex-1 flex flex-col items-center p-6">
      <div class="flex-1 flex flex-col items-center justify-center w-full gap-2">
        <span class="check"><i class="pi pi-check text-3xl" /></span>
        <h2 class="text-3xl font-bold mt-2">Charged €{{ formatPrice(order.total) }}</h2>
        <p class="opacity-70">
          {{ order.buyer.firstName }} {{ order.buyer.lastName }}
          <template v-if="order.balanceAfter !== null"> · Balance €{{ formatPrice(order.balanceAfter) }}</template>
        </p>
        <div class="lines w-full mt-4">
          <div v-for="line in order.products" :key="line.product.id" class="flex justify-between">
            <span>{{ line.count }}× {{ line.product.name }}</span>
            <span>€{{ formatPrice(line.count * line.product.priceInclVat.amount) }}</span>
          </div>
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <Button class="undo-button" :disabled="sending" outlined @click="emit('undo')">
          <i class="pi pi-undo" />
          {{ sending ? 'Placing order…' : `Undo (${secondsLeft}s)` }}
        </Button>
        <div class="meter"><span :style="{ width: `${progress * 100}%` }" /></div>
        <p class="text-center text-sm opacity-60">Logging out automatically</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlacedOrder } from '@/composables/useDelayedCheckout';
import { formatPrice } from '@/utils/FormatUtils';

defineProps<{ order: PlacedOrder; secondsLeft: number; progress: number; sending: boolean }>();
const emit = defineEmits<{ undo: [] }>();
</script>

<style scoped lang="scss">
.receipt {
  border-radius: var(--p-button-border-radius);
  background: white;
}

.check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--p-button-border-radius);
  background: #16a34a;
  color: white;
}

.lines {
  padding: 0.75rem 1rem;
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-button-border-radius);
  background: var(--p-surface-50);
}

.undo-button {
  padding: 0.9rem;
  font-size: 1.125rem;
}

.meter {
  height: 0.4rem;
  border-radius: var(--p-button-border-radius);
  background: var(--p-surface-200);
  overflow: hidden;

  > span {
    display: block;
    height: 100%;
    background: var(--p-primary-color);
    transition: width 0.1s linear;
  }
}
</style>
