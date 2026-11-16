<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg bier-bg"></div>
    <div class="content">
      <h1 class="welcome text-4xl">
        Thank you for using <span class="font-bold">SudoSOS</span> in <span class="font-bold">{{ wrapped.year }}</span
        >!
      </h1>

      <h1 :aria-hidden="step < 1" class="text-3xl pt-10 text-right fade-slide">
        Merry Christmas and a happy new year from the <span class="font-bold">ABC</span>!
      </h1>
    </div>

    <div v-if="!showArrows" class="swipe-hint flex flex-row fixed right-4 bottom-4 gap-2 items-center">
      <RouterLink :aria-hidden="step < 2" class="mb-10 fade-slide text-xl text-white" :to="{ name: 'home' }">
        Back to SudoSOS <i class="ml-2 pi pi-external-link"></i>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse; showArrows?: boolean }>();

const { step } = useCardReveal(() => props.active, [1200, 1200]);
</script>

<style scoped lang="scss">
.bier-bg {
  background-image: url('../../assets/img/bier.png');
  background-size: 90%;
  opacity: 0.4;
  transform: translate(-5%, 0) rotate(12deg);
}
</style>
