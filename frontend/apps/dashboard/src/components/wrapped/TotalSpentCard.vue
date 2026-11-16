<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg euro-bg">
      <i aria-hidden="true" class="pi pi-euro"></i>
    </div>
    <div class="content w-full">
      <h2 class="text-xl">
        In <span class="font-bold">{{ wrapped.year }}</span
        >, you spent a total of
      </h2>
      <h1 class="font-black text-6xl pt-2">{{ formatDineroObject(toDineroResponse(cents)) }}</h1>
      <div class="mt-2 flex flex-col items-end">
        <h2 class="text-2xl">using <span class="font-bold">SudoSOS</span>!</h2>
        <p :aria-hidden="step < 2" class="text-right mt-1 fade-slide">
          <span v-if="difference > 0" aria-hidden="true" class="pi pi-arrow-up" />
          <span v-if="difference < 0" aria-hidden="true" class="pi pi-arrow-down" />
          <template v-if="difference === 0">This is exactly the same as last year.</template>
          <template v-else>
            {{ formatDineroObject(toDineroResponse(Math.abs(difference))) }} compared to last year.
          </template>
        </p>
        <h2 :aria-hidden="step < 3" class="text-xl mt-8 self-start fade-slide">
          This puts you in the <span class="font-bold">top {{ percentile }}%</span> of spenders!
        </h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal, useCountUp } from '@/composables/wrappedCard';
import { formatDineroObject, toDineroResponse } from '@/utils/formatterUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const COUNT_DURATION = 2500;

const difference = computed(() => props.wrapped.totalSpent.amount - props.wrapped.previousTotalSpent.amount);
const percentile = computed(() => Math.round(props.wrapped.spentPercentile * 10) / 10);

const { step, done } = useCardReveal(() => props.active, [0, COUNT_DURATION + 600, 800]);
const cents = useCountUp(
  () => props.wrapped.totalSpent.amount,
  () => step.value >= 1,
  () => done.value,
  COUNT_DURATION,
);
</script>

<style scoped lang="scss">
.euro-bg {
  display: flex;
  justify-content: center;
  align-items: center;
}

.euro-bg .pi {
  font-size: 18rem;
  color: rgba(255, 255, 255, 0.2);
  transform: rotate(-12deg);
}
</style>
