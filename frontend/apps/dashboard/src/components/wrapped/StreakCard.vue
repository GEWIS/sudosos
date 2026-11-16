<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content w-full">
      <h2 class="text-xl">{{ t('components.wrapped.streak.active') }}</h2>
      <h1 class="text-2xl">
        <span class="text-6xl font-black">{{ days }}</span>
        {{ t('components.wrapped.streak.days', days) }}
      </h1>

      <i18n-t
        :aria-hidden="step < 1"
        class="text-xl pt-6 fade-slide"
        keypath="components.wrapped.streak.longest"
        scope="global"
        tag="h2"
      >
        <template #days>
          <span class="font-bold">{{ t('components.wrapped.streak.inARow', { count: streak }, streak) }}</span>
        </template>
      </i18n-t>

      <div :aria-hidden="step < 2" class="pt-8 fade-slide">
        <BarChart :labels="monthLabels" :revealed="step >= 2" :values="months" />
        <i18n-t class="text-lg pt-3" keypath="components.wrapped.streak.month" scope="global" tag="p">
          <template #month>
            <span class="font-bold capitalize">{{ monthName(busiestMonth, 'long') }}</span>
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
import BarChart from '@/components/wrapped/BarChart.vue';
import { useCardReveal } from '@/composables/wrappedCard';
import { activeDays, longestStreak, transactionsPerMonth } from '@/utils/wrappedUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t, locale } = useI18n();

const days = computed(() => activeDays(props.wrapped.transactions.transactionHeatmap));
const streak = computed(() => longestStreak(props.wrapped.transactions.transactionHeatmap));
const months = computed(() => transactionsPerMonth(props.wrapped));
const busiestMonth = computed(() => months.value.indexOf(Math.max(...months.value)));
const monthLabels = computed(() => months.value.map((_, month) => monthName(month, 'narrow')));

function monthName(month: number, format: 'long' | 'narrow'): string {
  return new Date(props.wrapped.year, month, 1).toLocaleDateString(locale.value, { month: format });
}

const { step } = useCardReveal(() => props.active, [1200, 1500]);
</script>
