<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg bier-bg"></div>
    <div class="content">
      <h1 class="welcome text-4xl">
        Thank you for using <span class="font-bold">SudoSOS</span> in <span class="font-bold">2025</span>!
      </h1>

      <h1 :aria-hidden="!showMerry" class="text-3xl pt-10 text-right fade-slide">
        Merry Christmas and a happy new year from the <span class="font-bold">ABC</span>!
      </h1>
    </div>

    <div
      v-if="!showArrows"
      class="swipe-hint flex flex-row align-middle fixed right-4 bottom-4 gap-2 items-center pointer-none:"
    >
      <p :aria-hidden="!showSwipe" class="mb-10 fade-slide cursor-pointer text-xl" role="button" @click="goHome">
        Back to SudoSOS <i class="ml-2 pi pi-external-link"></i>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRef, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
const props = defineProps<{ active?: boolean; showArrows?: boolean }>();
const active = toRef(props, 'active');
const showArrows = toRef(props, 'showArrows');

const router = useRouter();
function goHome() {
  void router.push({ name: 'home' });
}

const hasAnimated = ref(false);
const showMerry = ref(false);
const showSwipe = ref(false);

const MERRY_DELAY = 1200;
const SWIPE_AFTER_MERRY = 1200;
let merryTimeout: number | null = null;
let swipeTimeout: number | null = null;

function triggerAnimationIfNeeded() {
  if (active.value && !hasAnimated.value) {
    hasAnimated.value = true;
    showMerry.value = false;
    showSwipe.value = false;

    merryTimeout = window.setTimeout(() => {
      showMerry.value = true;
      merryTimeout = null;
      swipeTimeout = window.setTimeout(() => {
        if (!showArrows.value) showSwipe.value = true;
        swipeTimeout = null;
      }, SWIPE_AFTER_MERRY);
    }, MERRY_DELAY);
  }
}

watch(active, (val) => {
  if (val) triggerAnimationIfNeeded();
});

onMounted(() => {
  triggerAnimationIfNeeded();
});

onUnmounted(() => {
  if (merryTimeout != null) {
    clearTimeout(merryTimeout);
    merryTimeout = null;
  }
  if (swipeTimeout != null) {
    clearTimeout(swipeTimeout);
    swipeTimeout = null;
  }
});
</script>

<style scoped lang="scss">
.bier-bg {
  background-image: url('../../assets/img/bier.png');
  background-size: 90%;
  opacity: 0.4;
  transform: translate(-5%, 0) rotate(12deg);
}
</style>
