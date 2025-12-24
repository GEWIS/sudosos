<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div ref="rootRef" class="card-root text-white" :class="{ active }">
    <div class="bg chart-bg">
      <i aria-hidden="true" class="pi pi-chart-line"></i>
    </div>
    <div class="content">
      <h1 class="text-2xl">
        Of the <span class="font-bold">€{{ formatEuroFromCents(totalSpent) }}</span> you spent,
        <span class="font-bold">€{{ formatEuroFromCents(totalSpentBorrel) }}</span>
        was spent during borrels.
      </h1>
      <h2 :aria-hidden="!showPercentage" class="text-2xl pt-2 fade-slide">
        That is <span class="font-bold">{{ computePercentage(totalSpentBorrel) }}</span
        >!
      </h2>

      <div class="pt-6">
        <h1 :aria-hidden="!showSpentHeading" class="text-xl fade-slide">
          In <span class="font-bold">2025</span>, you spent:
        </h1>
        <ul>
          <li :aria-hidden="!(shownListCount >= 1)" class="fade-slide">
            <span class="font-bold"
              >€{{ formatEuroFromCents(totalSpentAlcohol) }} ({{ computePercentage(totalSpentAlcohol) }})</span
            >
            on alcohol.
          </li>
          <li :aria-hidden="!(shownListCount >= 2)" class="fade-slide">
            <span class="font-bold"
              >€{{ formatEuroFromCents(totalSpentSoda) }} ({{ computePercentage(totalSpentSoda) }})</span
            >
            on soda.
          </li>
          <li :aria-hidden="!(shownListCount >= 3)" class="fade-slide">
            <span class="font-bold"
              >€{{ formatEuroFromCents(totalSpentSnacks) }} ({{ computePercentage(totalSpentSnacks) }})</span
            >
            on snacks.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef, ref, onMounted, onUnmounted, watch, computed, unref, type ComputedRef } from 'vue';
import type { DineroObject } from 'dinero.js';

const props = defineProps<{
  active?: boolean;
  totalSpent: ComputedRef<DineroObject> | DineroObject;
  totalSpentBorrel: ComputedRef<DineroObject> | DineroObject;
  totalSpentAlcohol: ComputedRef<DineroObject> | DineroObject;
  totalSpentSoda: ComputedRef<DineroObject> | DineroObject;
  totalSpentSnacks: ComputedRef<DineroObject> | DineroObject;
}>();
const active = toRef(props, 'active');

function toCents(val: unknown): number {
  const v = unref(val);
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    const amt = obj.amount;
    if (typeof amt === 'number') return amt;
  }
  return 0;
}

const totalSpent = computed(() => toCents(props.totalSpent));
const totalSpentBorrel = computed(() => toCents(props.totalSpentBorrel));
const totalSpentAlcohol = computed(() => toCents(props.totalSpentAlcohol));
const totalSpentSoda = computed(() => toCents(props.totalSpentSoda));
const totalSpentSnacks = computed(() => toCents(props.totalSpentSnacks));

const rootRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let started = false;
const timeouts: number[] = [];

const showPercentage = ref(false);
const showSpentHeading = ref(false);
const shownListCount = ref(0);

function clearAllTimeouts() {
  for (const t of timeouts) {
    clearTimeout(t);
  }
  timeouts.splice(0, timeouts.length);
}

function scheduleReveal() {
  showPercentage.value = false;
  showSpentHeading.value = false;
  shownListCount.value = 0;

  timeouts.push(
    window.setTimeout(() => {
      showPercentage.value = true;
    }, 1000),
  );

  const headingDelay = 2000;
  timeouts.push(
    window.setTimeout(() => {
      showSpentHeading.value = true;
    }, headingDelay),
  );

  const firstItemDelay = headingDelay + 800;
  const gap = 800;
  for (let i = 0; i < 3; i++) {
    timeouts.push(
      window.setTimeout(
        () => {
          shownListCount.value = i + 1;
        },
        firstItemDelay + i * gap,
      ),
    );
  }
}

function tryStartAnimation() {
  if (started) return;
  started = true;
  scheduleReveal();
}

onMounted(() => {
  if (!rootRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 1) {
          // start only when both active and visible
          if (active.value) tryStartAnimation();
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
  clearAllTimeouts();
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

function formatEuroFromCents(cents: number) {
  const euros = cents / 100;
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(euros);
}

function computePercentage(part: number): string {
  const total = totalSpent.value || 0;
  if (total === 0) return '0%';
  const percentage = (part / total) * 100;
  return percentage.toFixed(0) + '%';
}
</script>

<style scoped lang="scss">
.chart-bg {
  position: absolute;
  inset: 0;
  justify-content: center;
  display: flex;
  align-items: center;
}

.chart-bg .pi {
  font-size: 18rem;
  color: rgba(255, 255, 255, 0.2);
  transform: rotate(-6deg);
  transform-origin: center;
}
</style>
