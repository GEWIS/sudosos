<template>
  <div class="card-root relative" :class="{ active }">
    <div class="content text-white">
      <i18n-t class="text-4xl" keypath="components.wrapped.welcome.hello" scope="global" tag="h1">
        <template #name>
          <span class="font-bold">{{ firstName }}</span>
        </template>
      </i18n-t>
      <h3 class="text-xl pt-4">{{ t('components.wrapped.welcome.intro') }}</h3>
      <h1 class="text-3xl font-bold">{{ t('components.wrapped.welcome.name') }}</h1>
      <p :aria-label="String(wrapped.year)" class="year text-8xl font-black leading-none pt-2">
        <span v-for="(digit, index) in String(wrapped.year)" :key="index" aria-hidden="true" :style="{ '--i': index }">
          {{ digit }}
        </span>
      </p>
    </div>

    <div v-if="!showArrows" class="text-white flex flex-row fixed right-4 bottom-4 gap-2 items-center">
      <p class="m-0">{{ t('components.wrapped.welcome.hint') }}</p>
      <i class="pi pi-arrow-right"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse; firstName?: string; showArrows?: boolean }>();

const { t } = useI18n();

useCardReveal(() => props.active, []);
</script>

<style scoped>
.year {
  color: #cdf564;
}

.year span {
  display: inline-block;
}

.active .year span {
  animation: bounce 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) calc(600ms + var(--i) * 120ms) infinite;
}

@keyframes bounce {
  0%,
  60%,
  100% {
    transform: none;
  }
  20% {
    transform: translateY(-0.18em) rotate(-6deg) scale(1.08);
  }
  40% {
    transform: translateY(0.04em) rotate(3deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .active .year span {
    animation: none;
  }
}
</style>
