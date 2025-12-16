<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div ref="rootRef" class="card-root text-white" :class="{ active }">
    <div class="bg euro-bg">
      <i aria-hidden="true" class="pi pi-euro"></i>
    </div>
    <div class="content w-full">
      <h2 class="text-xl">In <span class="font-bold">2025</span>, you spent a total of</h2>
      <h1 class="font-black text-6xl pt-2 items-center"><span class="sr-only">amount</span>{{ displayTotal }}</h1>
      <div class="mt-2 flex flex-col items-end relative">
        <h2 class="text-2xl">using <span class="font-bold">SudoSOS</span>!</h2>
        <p :aria-hidden="!comparisonText" class="comparison-text text-right fade-slide">
          <span v-if="comparisonSign === 'up'" aria-hidden="true" class="pi pi-arrow-up" />
          <span v-if="comparisonSign === 'down'" aria-hidden="true" class="pi pi-arrow-down" />
          {{ comparisonText }}
        </p>
        <h2 :aria-hidden="!percentileValue" class="text-xl percentile-text text-left fade-slide">
          This puts you in the <span class="font-bold">top {{ totalSpentPercentile }}%</span> of spenders!
        </h2>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, toRef, ref, onMounted, onUnmounted, watch, type ComputedRef, computed, unref } from 'vue';
// eslint-disable-next-line import/no-named-as-default
import Dinero, { type DineroObject } from 'dinero.js';
import { formatPrice } from '@/utils/formatterUtils';

const props = defineProps<{
  active?: boolean;
  totalSpent: ComputedRef<DineroObject> | DineroObject;
  previousTotalSpent: ComputedRef<DineroObject> | DineroObject;
  totalSpentPercentile: number;
}>();
const active = toRef(props, 'active');
const totalSpentProp = toRef(props, 'totalSpent');
const previousTotalSpentProp = toRef(props, 'previousTotalSpent');
const totalSpentPercentile = toRef(props, 'totalSpentPercentile');

// unwrap whether the parent passed a ref/computed or a plain object
const totalSpentValue = computed(() => unref(totalSpentProp) as DineroObject);
const previousTotalSpentValue = computed(() => unref(previousTotalSpentProp) as DineroObject);
const totalSpentPercentileValue = computed(() => unref(totalSpentPercentile));

const rootRef = ref<HTMLElement | null>(null);
const displayTotal = ref<string>(formatPrice(totalSpentValue.value));
const displayCents = ref<number>(0);
let rafId: number | null = null;
let observer: IntersectionObserver | null = null;
let started = false;

const animationDone = ref<boolean>(false);
const comparisonSign = ref<'up' | 'down' | 'same' | null>(null);
const comparisonText = ref<string | null>(null);
const percentileValue = ref<number | null>(null);
let percentileTimeout: number | null = null;
let comparisonTimeout: number | null = null;

const COMPARISON_DELAY = 600;
const PERCENTILE_DELAY = 800;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateTo(target: number, duration = 3500) {
  const start = performance.now();
  const from = displayCents.value || 0;
  const delta = target - from;
  if (delta <= 0) {
    displayCents.value = target;
    displayTotal.value = formatPrice({ amount: target, currency: 'EUR', precision: 2 });
    animationDone.value = true;
    if (comparisonTimeout != null) {
      clearTimeout(comparisonTimeout);
      comparisonTimeout = null;
    }
    comparisonTimeout = window.setTimeout(() => {
      computeComparison();
      comparisonTimeout = null;
    }, COMPARISON_DELAY);
    return;
  }

  function step(now: number) {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(progress);

    displayCents.value = Math.round(from + delta * eased);
    displayTotal.value = formatPrice({ amount: displayCents.value, currency: 'EUR', precision: 2 });

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      // ensure final values
      displayCents.value = target;
      displayTotal.value = formatPrice({ amount: target, currency: 'EUR', precision: 2 });
      rafId = null;
      animationDone.value = true;
      if (comparisonTimeout != null) {
        clearTimeout(comparisonTimeout);
        comparisonTimeout = null;
      }
      comparisonTimeout = window.setTimeout(() => {
        computeComparison();
        comparisonTimeout = null;
      }, COMPARISON_DELAY);
    }
  }

  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(step);
}

function tryStartAnimation() {
  // target is cents amount
  const target = Number(totalSpentValue.value?.amount ?? 0);
  if (started) return;
  if (!target || target <= 0) {
    started = true;
    displayCents.value = 0;
    displayTotal.value = formatPrice({ amount: 0, currency: 'EUR', precision: 2 });
    animationDone.value = true;
    if (comparisonTimeout != null) {
      clearTimeout(comparisonTimeout);
      comparisonTimeout = null;
    }
    comparisonTimeout = window.setTimeout(() => {
      computeComparison();
      comparisonTimeout = null;
    }, COMPARISON_DELAY);
    return;
  }
  started = true;
  animationDone.value = false;
  displayCents.value = 0;
  displayTotal.value = formatPrice({ amount: 0, currency: 'EUR', precision: 2 });
  animateTo(target);
}

onMounted(() => {
  if (!rootRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
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
  if (percentileTimeout != null) {
    clearTimeout(percentileTimeout);
    percentileTimeout = null;
  }
  if (comparisonTimeout != null) {
    clearTimeout(comparisonTimeout);
    comparisonTimeout = null;
  }
});

// If active becomes true after mount and the element is already visible, start immediately
watch(active, (val) => {
  if (!val) return;
  if (started) return;
  if (rootRef.value) {
    const rect = rootRef.value.getBoundingClientRect();
    const fullyVisible = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    if (fullyVisible) tryStartAnimation();
  }
});

function computeComparison() {
  // compute difference in cents between previous and current
  const diffObj = Dinero(totalSpentValue.value as Dinero.Options)
    .subtract(Dinero(previousTotalSpentValue.value as Dinero.Options))
    .toObject();

  const diff = Number(diffObj.amount ?? 0);
  // reset percentile value
  if (percentileTimeout != null) {
    clearTimeout(percentileTimeout);
    percentileTimeout = null;
  }
  if (comparisonTimeout != null) {
    clearTimeout(comparisonTimeout);
    comparisonTimeout = null;
  }
  percentileValue.value = null;
  if (Number.isNaN(diff)) {
    comparisonText.value = null;
    comparisonSign.value = null;
    return;
  }

  const abs = Math.abs(diff);
  if (diff === 0) {
    comparisonSign.value = 'same';
    comparisonText.value = 'This is exactly the same as last year.';
  } else if (diff > 0) {
    comparisonSign.value = 'up';
    comparisonText.value = `${formatPrice({ amount: abs, currency: 'EUR', precision: 2 })} compared to last year.`;
  } else {
    comparisonSign.value = 'down';
    comparisonText.value = `${formatPrice({ amount: abs, currency: 'EUR', precision: 2 })} compared to last year.`;
  }

  if (!Number.isNaN(Number(totalSpentPercentileValue.value))) {
    const p = Number(totalSpentPercentileValue.value);
    const pct = Math.round(p * 10) / 10;
    // clear any existing
    if (percentileTimeout != null) {
      clearTimeout(percentileTimeout);
      percentileTimeout = null;
    }
    percentileValue.value = null;
    percentileTimeout = window.setTimeout(() => {
      percentileValue.value = pct;
      percentileTimeout = null;
    }, PERCENTILE_DELAY);
  }
}
</script>
<style scoped lang="scss">
.euro-bg {
  position: absolute;
  display: flex;
  inset: 0;
  justify-content: center;
  align-items: center;
}

.euro-bg .pi {
  font-size: 18rem;
  color: rgba(255, 255, 255, 0.2);
  transform: rotate(-12deg);
  transform-origin: center;
}

.comparison-text {
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0;
  margin: 0;
}
.percentile-text {
  position: absolute;
  top: calc(100% + 4.5rem);
  right: 0;
  margin: 0;
}
</style>
