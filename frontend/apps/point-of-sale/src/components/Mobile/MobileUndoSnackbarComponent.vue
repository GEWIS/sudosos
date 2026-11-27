<template>
  <div class="snackbar">
    <span class="check"><i class="pi pi-check" /></span>
    <div class="flex-1 min-w-0">
      <div class="font-semibold truncate">{{ order.buyer.firstName }} charged €{{ formatPrice(order.total) }}</div>
      <div v-if="order.balanceAfter !== null" class="text-sm opacity-75">
        Balance €{{ formatPrice(order.balanceAfter) }}
      </div>
    </div>
    <button class="undo" :disabled="sending" type="button" @click="emit('undo')">
      {{ sending ? '…' : `Undo (${secondsLeft})` }}
    </button>
    <span class="meter" :style="{ width: `${progress * 100}%` }" />
  </div>
</template>

<script setup lang="ts">
import type { PlacedOrder } from '@/composables/useDelayedCheckout';
import { formatPrice } from '@/utils/FormatUtils';

defineProps<{ order: PlacedOrder; secondsLeft: number; progress: number; sending: boolean }>();
const emit = defineEmits<{ undo: [] }>();
</script>

<style scoped lang="scss">
.snackbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--p-button-border-radius);
  background: #1f2937;
  color: white;
  overflow: hidden;
  box-shadow: 0 10px 25px rgb(0 0 0 / 0.25);
}

.check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--p-button-border-radius);
  background: #16a34a;
}

.undo {
  padding: 0.4rem 0.6rem;
  border-radius: var(--p-button-border-radius);
  color: #fca5a5;
  font-weight: 700;
}

.meter {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  background: #fca5a5;
  transition: width 0.1s linear;
}
</style>
