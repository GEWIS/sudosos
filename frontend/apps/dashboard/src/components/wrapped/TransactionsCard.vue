<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-black" :class="{ active }">
    <div class="bg pos-bg"></div>

    <div class="content">
      <h2 class="text-xl">Over the past year,</h2>
      <h1 class="text-2xl">You have made a total of</h1>
      <div class="flex flex-row items-center gap-2 mt-2">
        <span class="text-5xl font-bold">{{ count.toLocaleString() }}</span>
        <p :aria-hidden="step < 2" class="text-sm m-0 fade-slide">
          <span v-if="difference > 0" aria-hidden="true" class="pi pi-arrow-up" />
          <span v-if="difference < 0" aria-hidden="true" class="pi pi-arrow-down" />
          <template v-if="difference === 0">This is exactly the same as last year!</template>
          <template v-else>{{ Math.abs(difference).toLocaleString() }} from last year!</template>
        </p>
      </div>
      <h1 class="text-2xl">Transaction{{ transactions.transactionCount == 1 ? '' : 's' }}!</h1>

      <p :aria-hidden="step < 3" class="mt-2 fade-slide">
        This puts you in the <span class="font-bold">top {{ percentile }}%</span> of SudoSOS users!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal, useCountUp } from '@/composables/wrappedCard';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const COUNT_DURATION = 2500;

const transactions = computed(() => props.wrapped.transactions);
const difference = computed(() => transactions.value.transactionCount - transactions.value.previousTransactionCount);
const percentile = computed(() => Math.round(transactions.value.transactionPercentile * 10) / 10);

const { step, done } = useCardReveal(() => props.active, [0, COUNT_DURATION + 300, 600]);
const count = useCountUp(
  () => transactions.value.transactionCount,
  () => step.value >= 1,
  () => done.value,
  COUNT_DURATION,
);
</script>

<style scoped>
.pos-bg {
  background-image: url('../../assets/img/wrapped/pos.png');
  background-size: 60%;
  opacity: 0.2;
  transform: translate(-20%, 20%) rotate(8deg);
}
</style>
