<template>
  <div class="card-root relative" :class="{ active }">
    <div class="bg bier-bg"></div>

    <div class="content text-white">
      <i18n-t class="text-4xl" keypath="components.wrapped.welcome.hello" scope="global" tag="h1">
        <template #name>
          <span class="font-bold">{{ firstName }}</span>
        </template>
      </i18n-t>
      <h3 class="text-xl pt-4">{{ t('components.wrapped.welcome.intro') }}</h3>
      <h1 class="text-3xl font-bold">{{ t('components.wrapped.welcome.title', { year: wrapped.year }) }}</h1>
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
.bier-bg {
  background-image: url('../../assets/img/bier.png');
  background-size: 90%;
  opacity: 0.4;
  transform: translate(-5%, 0) rotate(-12deg);
}
</style>
