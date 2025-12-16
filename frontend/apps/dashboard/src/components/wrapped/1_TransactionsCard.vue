<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div ref="rootRef" class="card-root text-black" :class="{ active }">
    <div class="bg pos-bg"></div>

    <div class="content">
      <h2 class="text-xl">Over the past year,</h2>
      <h1 class="text-2xl">You have made a total of</h1>
      <div class="flex flex-row items-center gap-2 mt-2">
        <span class="count text-5xl font-bold">{{ displayCount }}</span>
        <p :aria-hidden="!comparisonText" class="text-sm comparison-text fade-slide">
          <span v-if="comparisonSign === 'up'" aria-hidden="true" class="pi pi-arrow-up" />
          <span v-if="comparisonSign === 'down'" aria-hidden="true" class="pi pi-arrow-down" />
          {{ comparisonText }}
        </p>
      </div>
      <h1 class="text-2xl">Transaction{{ transactionCountValue == 1 ? '' : 's' }}!</h1>

      <div class="percent-space mt-2">
        <span :aria-hidden="!percentileValue" class="percentile-text fade-slide">
          This puts you in the <span class="font-bold">top {{ transactionPercentileValue }}%</span> of SudoSOS users!
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRef, ref, onMounted, onUnmounted, unref, computed } from 'vue';

const props = defineProps<{
  active?: boolean;
  transactionCount?: number;
  previousTransactionCount?: number;
  transactionPercentile?: number;
}>();
const active = toRef(props, 'active');
const transactionCountProp = toRef(props, 'transactionCount');
const previousTransactionCountProp = toRef(props, 'previousTransactionCount');
const transactionPercentileProp = toRef(props, 'transactionPercentile');

const transactionCountValue = computed(() => unref(transactionCountProp));
const previousTransactionCountValue = computed(() => unref(previousTransactionCountProp));
const transactionPercentileValue = computed(() => unref(transactionPercentileProp));

const displayCount = ref<number>(0);
const animationDone = ref<boolean>(false);
const comparisonSign = ref<'up' | 'down' | 'same' | null>(null);
const comparisonText = ref<string | null>(null);
const percentileValue = ref<number | null>(null);

const rootRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let rafId: number | null = null;
let started = false;
let percentileTimeout: number | null = null;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateTo(target: number, duration = 3500) {
  const start = performance.now();
  const from = displayCount.value || 0;
  const delta = target - from;
  if (delta <= 0) {
    displayCount.value = target;
    animationDone.value = true;
    computeComparison(Number(transactionCountValue.value ?? 0));
    return;
  }

  function step(now: number) {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(progress);

    displayCount.value = Math.round(from + delta * eased);
    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      // ensure final values
      displayCount.value = target;
      rafId = null;
      // mark animation done and compute comparison
      animationDone.value = true;
      computeComparison(target);
    }
  }

  // cancel any running animation
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(step);
}

function tryStartAnimation() {
  const target = Number(transactionCountValue.value ?? 0);
  if (started) return;
  if (!target || target <= 0) {
    started = true;
    displayCount.value = 0;
    animationDone.value = true;
    computeComparison(0);
    return;
  }
  started = true;
  // reset visual start state
  displayCount.value = 0;
  animationDone.value = false;
  animateTo(target);
}

onMounted(() => {
  if (!rootRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // threshold 1.0 ensures it's fully visible
        if (entry.isIntersecting && entry.intersectionRatio >= 1) {
          tryStartAnimation();
          if (observer) {
            observer.disconnect();
            observer = null;
          }
        }
      }
    },
    { threshold: [1.0] },
  );

  observer.observe(rootRef.value);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  // clean up any pending percentile reveal
  if (percentileTimeout != null) {
    clearTimeout(percentileTimeout);
    percentileTimeout = null;
  }
});

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat('en-US').format(n);
  } catch {
    return String(n);
  }
}

function computeComparison(current: number) {
  const prev = Number(previousTransactionCountValue.value ?? 0);
  // if no previous provided, don't show
  if (previousTransactionCountValue.value == null) {
    comparisonText.value = null;
    // clear any pending percentile reveal
    if (percentileTimeout != null) {
      clearTimeout(percentileTimeout);
      percentileTimeout = null;
    }
    percentileValue.value = null;
    return;
  }

  const diff = current - prev;
  const abs = Math.abs(diff);

  if (diff == 0) {
    comparisonSign.value = 'same';
    comparisonText.value = 'This is exactly the same as last year!';
  } else if (diff > 0) {
    comparisonSign.value = 'up';
    comparisonText.value = `${formatNumber(abs)} from last year!`;
  } else {
    comparisonSign.value = 'down';
    comparisonText.value = `${formatNumber(abs)} from last year!`;
  }

  // delay showing percentile line slightly so it appears after the comparison text
  // clear any previous timeout
  if (percentileTimeout != null) {
    clearTimeout(percentileTimeout);
    percentileTimeout = null;
  }
  percentileValue.value = null;
  if (transactionCountValue.value != null && !Number.isNaN(Number(transactionPercentileValue.value))) {
    const p = Number(transactionPercentileValue.value);
    const pct = Math.round(p * 10) / 10;
    // schedule reveal slightly after comparison appears
    percentileTimeout = window.setTimeout(() => {
      percentileValue.value = pct;
      percentileTimeout = null;
    }, 600);
  }
}
</script>

<style scoped>
.pos-bg {
  background-image: url('../../assets/img/wrapped/pos.png');
  background-size: 60%;
  opacity: 0.2;
  transform: translate(-20%, 20%) rotate(8deg);
}

.count {
  display: inline-block;
  transform-origin: center center;
  will-change: transform, opacity;
}

.comparison-text {
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
}

.right h3 {
  transform: translateY(0);
  opacity: 1;
}

.right p {
  transform: translateY(0);
  opacity: 1;
}

.percent-space {
  height: 1.25rem;
  position: relative;
}

.percentile-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
}
</style>
