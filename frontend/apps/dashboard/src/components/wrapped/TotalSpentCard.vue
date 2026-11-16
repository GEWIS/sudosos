<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg euro-bg">
      <i aria-hidden="true" class="pi pi-euro"></i>
    </div>
    <div class="content w-full">
      <h2 class="text-xl">{{ t('components.wrapped.totalSpent.intro', { year: wrapped.year }) }}</h2>
      <h1 class="font-black text-6xl pt-2">{{ formatDineroObject(toDineroResponse(cents)) }}</h1>
      <div class="mt-2 flex flex-col items-end">
        <i18n-t class="text-2xl" keypath="components.wrapped.totalSpent.using" scope="global" tag="h2">
          <template #sudosos>
            <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
            <span class="font-bold">SudoSOS</span>
          </template>
        </i18n-t>
        <p :aria-hidden="step < 2" class="text-right mt-1 fade-slide">
          <span
            v-if="difference !== 0"
            aria-hidden="true"
            class="pi"
            :class="difference > 0 ? 'pi-arrow-up' : 'pi-arrow-down'"
          />
          {{ comparison }}
        </p>
        <i18n-t
          v-if="wrapped.spentPercentile <= 50"
          :aria-hidden="step < 3"
          class="text-xl mt-8 self-start fade-slide"
          keypath="components.wrapped.totalSpent.percentile"
          scope="global"
          tag="h2"
        >
          <template #top>
            <span class="font-bold">{{ t('components.wrapped.top', { percentile }) }}</span>
          </template>
        </i18n-t>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal, useCountUp } from '@/composables/wrappedCard';
import { formatDineroObject, toDineroResponse } from '@/utils/formatterUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t, locale } = useI18n();

const COUNT_DURATION = 2500;

const difference = computed(() => props.wrapped.totalSpent.amount - props.wrapped.previousTotalSpent.amount);
const percentile = computed(() => props.wrapped.spentPercentile.toLocaleString(locale.value));

const comparison = computed(() => {
  if (difference.value === 0) return t('components.wrapped.totalSpent.same');

  const amount = formatDineroObject(toDineroResponse(Math.abs(difference.value)));
  return difference.value > 0
    ? t('components.wrapped.totalSpent.more', { amount })
    : t('components.wrapped.totalSpent.less', { amount });
});

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
