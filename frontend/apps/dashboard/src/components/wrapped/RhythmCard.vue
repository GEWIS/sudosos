<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content w-full">
      <h2 class="text-xl">{{ t('components.wrapped.rhythm.weekday') }}</h2>
      <h1 class="text-4xl font-bold capitalize">{{ weekdayName(favouriteWeekday, locale, 'long') }}</h1>
      <p class="mb-3">{{ t('components.wrapped.rhythm.weekdayShare', { share: weekdayShare }) }}</p>
      <BarChart
        :labels="weekdays.map((_, weekday) => weekdayName(weekday, locale, 'narrow'))"
        :revealed="step >= 1"
        :values="weekdays"
      />

      <div :aria-hidden="step < 2" class="pt-8 fade-slide">
        <h2 class="text-xl">{{ t('components.wrapped.rhythm.hour') }}</h2>
        <h1 class="text-4xl font-bold mb-3">{{ formatHour(favouriteHour) }}</h1>
        <BarChart :labels="hourLabels" :revealed="step >= 2" :values="hours" />
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
import { formatDate, transactionsPerWeekday, weekdayName } from '@/utils/wrappedUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t, locale } = useI18n();

// A Wrapped day starts at 06:00, so the chart does too and ends with the night.
const DAY_START_HOUR = 6;

const weekdays = computed(() => transactionsPerWeekday(props.wrapped));
const favouriteWeekday = computed(() => weekdays.value.indexOf(Math.max(...weekdays.value)));
const weekdayShare = computed(() =>
  (weekdays.value[favouriteWeekday.value] / props.wrapped.transactions.transactionCount).toLocaleString(locale.value, {
    style: 'percent',
    maximumFractionDigits: 0,
  }),
);

const hourOrder = Array.from({ length: 24 }, (_, index) => (index + DAY_START_HOUR) % 24);
const hours = computed(() => hourOrder.map((hour) => props.wrapped.transactions.hourHistogram[hour]));
const favouriteHour = computed(() => hourOrder[hours.value.indexOf(Math.max(...hours.value))]);
const hourLabels = hourOrder.map((hour) => (hour % 6 === 0 ? String(hour) : ''));

function formatHour(hour: number): string {
  return formatDate(new Date(2024, 0, 1, hour), locale.value, { hour: '2-digit', minute: '2-digit' });
}

const { step } = useCardReveal(() => props.active, [300, 1800]);
</script>
