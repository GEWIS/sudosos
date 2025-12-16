<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content flex flex-1 items-stretch relative overflow-visible">
      <div ref="wrapperRef" class="heatmap-wrapper" :class="{ centered: isCentered, moved: moved }">
        <div class="grid relative w-full h-full" :style="gridStyle">
          <div
            v-for="(weekday, i) in weekdays"
            :key="weekday"
            class="pb-1 flex items-center font-semibold sticky top-0"
            :style="{ gridColumn: i + 1, gridRow: 1 }"
          >
            <span class="inline-block w-[9px] origin-center text-center text-[0.65rem]">{{ weekday }}</span>
          </div>
          <div
            v-for="d in daysOfYear"
            :key="d.index"
            class="cell w-[9px] h-[9px] box-border rounded-[3px] bg-transparent"
            :class="{ revealed: isRevealed(d.index) }"
            :style="{ ...cellStyle(d.value), gridColumn: d.weekday + 1, gridRow: d.week + 2 }"
            :title="cellTitle(d.value)"
          ></div>
        </div>
      </div>

      <!-- right: side panel with text -->
      <div class="heatmap-side pl-5 flex flex-col justify-center" :class="{ visible: showSide }">
        <div :aria-hidden="!showText" class="text fade-slide">
          <div class="flex flex-column items-center">
            <h1 class="text-2xl whitespace-nowrap">
              On <span class="font-bold">{{ formattedMaxDate }}</span
              >,
            </h1>
          </div>
          <h2 class="text-xl py-2">you made</h2>
          <div class="flex flex-column items-center">
            <h1 class="font-bold text-4xl">{{ maxAmountValue }}</h1>
            <h2 class="text-2xl pl-2">transactions!</h2>
          </div>
          <h3 :aria-hidden="!showText" class="subtext fade-slide text-s font-extralight pt-2">
            This was the highest number of transactions you made on a single day.
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRef, computed, ref, watch, unref } from 'vue';

const props = defineProps<{
  active?: boolean;
  heatmap: number[];
  maxDate: Date | null;
  maxAmount: number;
}>();
const active = toRef(props, 'active');
const heatmapProp = toRef(props, 'heatmap');
const maxDateProp = toRef(props, 'maxDate');
const maxAmountProp = toRef(props, 'maxAmount');

const heatmapValue = computed(() => unref(heatmapProp));
const maxDateValue = computed(() => unref(maxDateProp));
const maxAmountValue = computed(() => unref(maxAmountProp));

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function daysInYear(heatmap: number[] = []) {
  const days: { index: number; value: number; weekday: number; week: number }[] = [];
  const startWeekday = 2; // 2025 started on a Wednesday
  const totalDays = 365; // 2025 is not a leap year
  for (let i = 0; i < totalDays; i++) {
    const value = heatmap[i] ?? 0; // default missing entries to 0
    const weekday = (startWeekday + i) % 7;
    const week = Math.floor((startWeekday + i) / 7);
    days.push({ index: i, value, weekday, week });
  }
  return days;
}

// make daysOfYear reactive to heatmap prop
const daysOfYear = computed(() => daysInYear(heatmapValue.value ?? []));

const weeksCount = 53; // 2025 has 53 weeks

const wrapperRef = ref<HTMLElement | null>(null);
const cellSize = ref(9);

const gridStyle = computed(() => {
  const sizePx = `${cellSize.value}px`;
  return {
    gridTemplateColumns: `repeat(${weekdays.length}, ${sizePx})`,
    gridTemplateRows: `var(--header-height) repeat(${weeksCount}, ${sizePx})`,
    width: `${cellSize.value * weekdays.length}px`,
    height: `${cellSize.value * (weeksCount + 1)}px`,
    '--header-height': sizePx,
  } as Record<string, string>;
});

function intensityForValue(v?: number) {
  if (v === undefined || v === 0 || maxAmountValue.value === 0) return 0;
  return Math.max(0, Math.min(1, v / maxAmountValue.value));
}

function colorForIntensity(t: number) {
  const hue = 120;
  const saturation = Math.round(50 + t * 40);
  const lightness = Math.round(50 + t * 30);
  const alpha = Math.min(1, 0.25 + t * 0.9);
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

function cellStyle(value: number) {
  const t = intensityForValue(value);
  const background = t > 0 ? colorForIntensity(t) : 'rgba(200,200,200,0.12)';
  return { background } as Record<string, string>;
}

function cellTitle(value?: number) {
  return `${value ?? 0} Transaction${value === 1 ? '' : 's'}`;
}

const revealed = ref(new Set<number>());
type Stage = 'idle' | 'revealing' | 'moved' | 'showingText' | 'finished';
const stage = ref<Stage>('idle');

const moved = computed(() => stage.value === 'moved' || stage.value === 'showingText' || stage.value === 'finished');
const isCentered = computed(() => stage.value === 'idle' || stage.value === 'revealing');

const showSide = ref(false);
const showText = ref(false);

let animationToken = 0;

// only play the reveal animation the first time the card becomes active
const hasPlayed = ref(false);

function isRevealed(index: number) {
  return revealed.value.has(index);
}

function resetAnimationState() {
  // bump token to cancel any running animation
  animationToken++;
  revealed.value = new Set<number>();
  stage.value = 'idle';
  showSide.value = false;
  showText.value = false;
}

async function runAnimation(token: number) {
  // initial hide
  showSide.value = false;
  showText.value = false;

  // mark as centered & start revealing
  stage.value = 'revealing';

  // Reveal days using an ease-in-out curve so delays are shorter in the middle.
  const days = daysOfYear.value;
  const n = days.length;

  const duration = 3500;
  const totalDuration = Math.max(1, Math.round(duration ?? 0));

  const alpha = 0.85; // contrast (0 = uniform, closer to 1 = stronger edge emphasis)
  const weights: number[] = new Array(n);
  let sumw = 0;
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1); // normalized position in [0,1]
    // cos(2πx) gives 1 at edges (x=0,1) and -1 at center (x=0.5)
    weights[i] = 1 + alpha * Math.cos(2 * Math.PI * x);
    sumw += weights[i];
  }

  for (let i = 0; i < n; i++) {
    if (token !== animationToken) return; // cancelled

    const wait = Math.max(0, Math.round((weights[i] / sumw) * totalDuration));
    await new Promise((res) => setTimeout(res, wait));
    if (token !== animationToken) return;

    revealed.value.add(days[i].index);
  }

  if (token !== animationToken) return;

  // brief pause then trigger move
  await new Promise((res) => setTimeout(res, 120));
  if (token !== animationToken) return;

  stage.value = 'moved';

  await new Promise((res) => {
    if (!wrapperRef.value) return res(null);
    const el = wrapperRef.value;
    const handler = (ev: TransitionEvent) => {
      if (ev.propertyName === 'left' || ev.propertyName === 'transform') {
        el.removeEventListener('transitionend', handler);
        res(null);
      }
    };
    el.addEventListener('transitionend', handler);
  });
  if (token !== animationToken) return;

  stage.value = 'showingText';
  showSide.value = true;
  await new Promise((res) => setTimeout(res, 80));
  if (token !== animationToken) return;

  showText.value = true;
  await new Promise((res) => setTimeout(res, 140));
  if (token !== animationToken) return;

  // finalize
  hasPlayed.value = true;
  stage.value = 'finished';
}

watch(
  active,
  (v) => {
    if (v) {
      if (!hasPlayed.value) {
        resetAnimationState();
        const token = animationToken;
        setTimeout(() => runAnimation(token), 40);
      } else {
        revealed.value = new Set(daysOfYear.value.map((d) => d.index));
        stage.value = 'finished';
        showSide.value = true;
        showText.value = true;
      }
    }
  },
  { immediate: false },
);

function getOrdinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatDate(date: Date): string {
  const month = date.toLocaleString(undefined, { month: 'long' });
  const day = date.getDate();
  return `${month} ${day}${getOrdinal(day)}`;
}

// safe computed string for template
const formattedMaxDate = computed(() => {
  const d = maxDateValue.value;
  return d instanceof Date ? formatDate(d) : '';
});
</script>

<style scoped>
.heatmap-wrapper {
  position: relative;
  transition:
    transform 0.6s ease,
    left 0.6s ease;
  left: 50%;
  transform: translateX(-50%);
}
.heatmap-wrapper.centered {
  left: 50%;
  transform: translateX(-50%);
}
.heatmap-wrapper.moved {
  left: 0;
  transform: translateX(0);
}

.cell {
  opacity: 0;
  transition:
    background 120ms ease,
    opacity 120ms ease;
}
.cell.revealed {
  opacity: 1;
}

.heatmap-side {
  opacity: 0;
  transition: opacity 0ms ease;
}
.heatmap-side.visible {
  opacity: 1;
}

.subtext[aria-hidden='false'] {
  transition-delay: 1000ms;
}
</style>
