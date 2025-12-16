<template>
  <div class="flex items-center justify-center">
    <div class="flex items-center">
      <div ref="pagerInner" class="pager-inner" :style="{ transform: `translateX(${translatePx}px)` }">
        <button
          v-for="index in slots"
          :key="index"
          :aria-label="`Go to card ${index + 1}`"
          class="pager-dot rounded-full bg-white"
          :style="{
            transform: `scale(${dotScaleForSlot(index)})`,
            zIndex: dotZIndexForSlot(index),
          }"
          @click="onGo(index)"
        >
          <span :aria-hidden="currentIndex !== index" class="pager-dot-inner ring-1 ring-black/20" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';

const props = defineProps<{
  totalCards: number;
  currentIndex: number;
}>();

const emit = defineEmits<{ (e: 'go', index: number): void }>();

const pagerInner = ref<HTMLElement | null>(null);
const translatePx = ref(0);

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

const slots = computed(() => {
  const total = Math.max(0, Number(props.totalCards ?? 0));
  return Array.from({ length: total }, (_, i) => i);
});

async function updateTranslate() {
  await nextTick();
  const inner = pagerInner.value;
  if (!inner) return;

  const parent = inner.parentElement;
  if (!parent) return;

  const buttons = Array.from(inner.querySelectorAll('button'));
  // find active button inside current slots
  const activeIdx = slots.value.indexOf(props.currentIndex);
  const activeBtn = buttons[activeIdx] as HTMLElement | undefined;

  // if active not visible, default to aligning start
  if (!activeBtn) {
    // shift to show the start of inner
    translatePx.value = clamp(0, parent.offsetWidth - inner.scrollWidth, 0);
    return;
  }

  // center active button in parent
  const activeCenter = activeBtn.offsetLeft + activeBtn.offsetWidth / 2;
  const target = parent.offsetWidth / 2 - activeCenter;

  // clamp to avoid empty space
  const minTranslate = Math.min(0, parent.offsetWidth - inner.scrollWidth);
  const maxTranslate = 0;
  translatePx.value = clamp(target, minTranslate, maxTranslate);
}

onMounted(async () => {
  await updateTranslate();
});

watch([() => props.currentIndex, slots], async () => {
  await updateTranslate();
});

function dotScaleForSlot(index: number) {
  return index === props.currentIndex ? 1.4 : 1;
}

function dotZIndexForSlot(index: number) {
  return index === props.currentIndex ? 20 : 10;
}

function onGo(index: number) {
  emit('go', index);
}
</script>

<style>
.pager-inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.pager-dot {
  /* Outer container that provides the arrow-like outline (ring, shadow, backdrop) */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* keep the visible dot small; outer button provides a slightly larger clickable area via padding
     but does not change the visual dot size */
  padding: 0.25rem; /* increases hit area without enlarging the dot */
  background: transparent; /* remove white fill so the inner dot remains the visible element */
  border: none;
  outline: none;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  transition:
    box-shadow 200ms ease,
    transform 200ms ease,
    border-color 200ms ease,
    background-color 200ms ease;
}

.pager-dot-inner {
  /* The small visual dot that scales when active (same size as before) */
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: white;
  transform-origin: center center;
  transition:
    transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 200ms ease,
    background-color 200ms ease;
  will-change: transform, opacity;
  display: inline-block;
}
</style>
