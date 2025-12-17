<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div ref="rootRef" class="card-root relative" :class="{ active }">
    <div
      class="focus-overlay bg-[#b40000] z-10 text-white absolute inset-0 flex flex-col items-center justify-center p-1 text-center"
      :class="{ visible: overlayVisible }"
    >
      <h1 class="font-bold text-xl">Make sure the window is focused</h1>
      <h2 class="italic pt-4">Swipe down until this text disappears.</h2>
    </div>
    <div class="bg bier-bg"></div>

    <div class="content text-white">
      <h1 class="welcome text-4xl">
        Hello <span class="font-bold">{{ firstName }}</span
        >!
      </h1>
      <h3 class="text-xl pt-4">Welcome to your</h3>
      <h1 class="text-3xl font-bold">SudoSOS Wrapped!</h1>
    </div>

    <div
      v-if="!showArrows"
      class="swipe-hint text-white flex flex-row align-middle fixed right-4 bottom-4 gap-2 items-center pointer-none:"
    >
      <p class="m-0">Swipe left to get started</p>
      <i class="pi pi-arrow-right"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRef, ref, onMounted, onUnmounted, watch } from 'vue';
const props = defineProps<{ active?: boolean; firstName?: string; showArrows?: boolean }>();
const active = toRef(props, 'active');
const firstName = toRef(props, 'firstName');
const showArrows = toRef(props, 'showArrows');

const rootRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let overlayTimeout: number | null = null;
let started = false;
const overlayVisible = ref(!showArrows.value);
let pendingWatcher: (() => void) | null = null;

function scheduleHide() {
  if (overlayTimeout != null) {
    clearTimeout(overlayTimeout);
    overlayTimeout = null;
  }
  overlayTimeout = window.setTimeout(() => {
    overlayVisible.value = false;
    overlayTimeout = null;
  }, 1);
  // once scheduled, disconnect observer and stop watching active
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (pendingWatcher) {
    pendingWatcher();
    pendingWatcher = null;
  }
}

function tryStartAnimation() {
  if (started) return;
  started = true;

  // If screen isn't narrow, don't show the overlay — disconnect observer and exit
  if (showArrows.value) {
    overlayVisible.value = false;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    return;
  }

  // ensure overlay is shown when animation starts
  overlayVisible.value = true;

  // If the card is active right now, schedule the hide immediately.
  // Otherwise, wait until `active` becomes true.
  if (active.value) {
    scheduleHide();
  } else {
    // watch for active -> true, then schedule hide; store the stop handle to clean up later
    pendingWatcher = watch(active, (v) => {
      if (v) scheduleHide();
    });
  }
}

onMounted(() => {
  if (!rootRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // threshold 1.0 ensures it's fully visible
        if (entry.isIntersecting && entry.intersectionRatio >= 1) {
          tryStartAnimation();
        }
      }
    },
    { threshold: [1.0] },
  );

  observer.observe(rootRef.value);

  // If the card is already fully visible on mount, attempt to start the animation
  const rect = rootRef.value.getBoundingClientRect();
  const fullyVisible = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
  if (fullyVisible) tryStartAnimation();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (overlayTimeout != null) {
    clearTimeout(overlayTimeout);
    overlayTimeout = null;
  }
  if (pendingWatcher) {
    pendingWatcher();
    pendingWatcher = null;
  }
});
</script>

<style scoped>
.bier-bg {
  background-image: url('../../assets/img/bier.png');
  background-size: 90%;
  opacity: 0.4;
  transform: translate(-5%, 0) rotate(-12deg);
}

.focus-overlay {
  opacity: 0;
  transition: opacity 1ms ease-in-out;
}

.focus-overlay.visible {
  opacity: 1;
}
</style>
