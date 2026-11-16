<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content flex items-center">
      <div class="heatmap" :class="{ revealed: step >= 1, moved: step >= 2 }">
        <span
          v-for="(weekday, index) in weekdays"
          :key="index"
          class="label text-center font-semibold"
          :style="{ gridColumn: index + 2, gridRow: 1 }"
        >
          {{ weekday }}
        </span>
        <span
          v-for="month in months"
          :key="month.name"
          class="label pr-1 text-right"
          :style="{ gridColumn: 1, gridRow: month.row }"
        >
          {{ month.name }}
        </span>
        <button
          v-for="day in days"
          :key="day.index"
          :aria-label="`${formatDay(day.index)}: ${day.count}`"
          class="cell"
          :class="{ busiest: day.index === busiestDay, selected: day.index === shownDay }"
          :style="day.style"
          type="button"
          @click="selectedDay = day.index"
        ></button>
      </div>

      <div :aria-hidden="step < 2" class="side fade-slide">
        <h1 class="text-2xl">
          On <span class="font-bold">{{ formatDay(shownDay) }}</span
          >,
        </h1>
        <h2 class="text-xl py-2">you made</h2>
        <h1 class="text-2xl">
          <span class="font-bold text-4xl">{{ heatmap[shownDay] }}</span>
          transaction{{ heatmap[shownDay] == 1 ? '' : 's' }}!
        </h1>
        <h3 :aria-hidden="step < 3 || shownDay !== busiestDay" class="font-extralight pt-2 fade-slide">
          This was the highest number of transactions you made on a single day.
        </h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const heatmap = computed(() => props.wrapped.transactions.transactionHeatmap);
const busiestDay = computed(() => heatmap.value.indexOf(props.wrapped.transactions.transactionMaxAmount));
const selectedDay = ref<number>();
const shownDay = computed(() => selectedDay.value ?? busiestDay.value);

const firstWeekday = computed(() => (new Date(props.wrapped.year, 0, 1).getDay() + 6) % 7);

function rowOf(day: number): number {
  return Math.floor((firstWeekday.value + day) / 7) + 2;
}

function dateOf(day: number): Date {
  return new Date(props.wrapped.year, 0, 1 + day);
}

function formatDay(day: number): string {
  return dateOf(day).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

const days = computed(() => {
  const max = props.wrapped.transactions.transactionMaxAmount;
  return heatmap.value.map((count, index) => {
    const intensity = count / max;
    return {
      index,
      count,
      style: {
        gridColumn: ((firstWeekday.value + index) % 7) + 2,
        gridRow: rowOf(index),
        background:
          count > 0
            ? `hsla(120, ${50 + intensity * 40}%, ${50 + intensity * 30}%, ${Math.min(1, 0.25 + intensity * 0.9)})`
            : 'rgba(200, 200, 200, 0.12)',
        '--day': index,
      },
    };
  });
});

const months = computed(() =>
  Array.from({ length: 12 }, (_, month) => {
    const firstDay = new Date(props.wrapped.year, month, 1);
    const dayOfYear = Math.round((firstDay.getTime() - dateOf(0).getTime()) / 86_400_000);
    return { name: firstDay.toLocaleDateString(undefined, { month: 'short' }), row: rowOf(dayOfYear) };
  }),
);

const REVEAL_DURATION = 3300;

const { step } = useCardReveal(() => props.active, [40, REVEAL_DURATION + 200, 1000]);
</script>

<style scoped>
.card-root {
  container-type: size;
}

.content {
  --gap: 1.25rem;
  /* The text column gives way on narrow phones, next to a heatmap of about 6rem. */
  --side: min(12rem, 100cqw - 6rem - var(--gap));
  gap: var(--gap);
}

.heatmap {
  --cell: min(11px, 100cqh / 58);
  display: grid;
  grid-template-columns: auto repeat(7, var(--cell));
  grid-auto-rows: var(--cell);
  gap: 1px;
  /* Centres the heatmap while the text next to it is still hidden. */
  transform: translateX(calc((var(--side) + var(--gap)) / 2));
  transition: transform 600ms ease;
}

.heatmap.moved {
  transform: none;
}

.side {
  width: var(--side);
  overflow-wrap: break-word;
}

@container (max-width: 340px) {
  .content {
    --gap: 0.75rem;
  }

  .side .text-xl {
    font-size: 1rem;
  }

  .side .text-2xl {
    font-size: 1.125rem;
  }

  .side .text-4xl {
    font-size: 1.875rem;
  }
}

.label {
  font-size: 0.6rem;
  line-height: var(--cell);
}

.cell {
  padding: 0;
  border: none;
  border-radius: 3px;
  opacity: 0;
  cursor: pointer;
}

.revealed .cell {
  animation: cell-in 150ms ease forwards;
  animation-delay: calc(var(--day) * 9ms);
}

.moved .cell.selected {
  outline: 2px solid white;
  z-index: 1;
}

.moved .cell.busiest {
  animation:
    cell-in 0ms forwards,
    pulse 1600ms ease-in-out infinite;
}

@keyframes cell-in {
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  50% {
    transform: scale(1.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .revealed .cell,
  .moved .cell.busiest {
    animation: none;
    opacity: 1;
  }
}
</style>
