<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg pos-bg"></div>

    <div class="content">
      <h2 class="text-2xl">{{ t('components.wrapped.transactions.intro', { year: wrapped.year }) }}</h2>
      <div class="flex flex-row items-center gap-2 mt-2">
        <span class="text-5xl font-bold">{{ count.toLocaleString(locale) }}</span>
        <p :aria-hidden="step < 2" class="text-sm m-0 fade-slide">
          <span
            v-if="difference !== 0"
            aria-hidden="true"
            class="pi"
            :class="difference > 0 ? 'pi-arrow-up' : 'pi-arrow-down'"
          />
          {{ comparison }}
        </p>
      </div>
      <h1 class="text-2xl">{{ t('components.wrapped.transactions.unit', transactions.transactionCount) }}</h1>

      <i18n-t
        v-if="transactions.transactionPercentile <= 50"
        :aria-hidden="step < 3"
        class="mt-2 fade-slide"
        keypath="components.wrapped.transactions.percentile"
        scope="global"
        tag="p"
      >
        <template #top>
          <span class="font-bold">{{ t('components.wrapped.top', { percentile }) }}</span>
        </template>
      </i18n-t>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal, useCountUp } from '@/composables/wrappedCard';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t, locale } = useI18n();

const COUNT_DURATION = 2500;

const transactions = computed(() => props.wrapped.transactions);
const difference = computed(() => transactions.value.transactionCount - transactions.value.previousTransactionCount);
const percentile = computed(() =>
  transactions.value.transactionPercentile.toLocaleString(locale.value, { maximumFractionDigits: 1 }),
);

const comparison = computed(() => {
  if (difference.value === 0) return t('components.wrapped.transactions.same');

  const count = Math.abs(difference.value).toLocaleString(locale.value);
  return difference.value > 0
    ? t('components.wrapped.transactions.more', { count })
    : t('components.wrapped.transactions.fewer', { count });
});

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
  opacity: 0.15;
  filter: brightness(0) invert(1);
  transform: translate(-20%, 20%) rotate(8deg);
}
</style>
