<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg bier-bg"></div>
    <div class="content">
      <i18n-t class="text-4xl" keypath="components.wrapped.final.thanks" scope="global" tag="h1">
        <template #sudosos>
          <span class="font-bold">SudoSOS</span>
        </template>
        <template #year>
          <span class="font-bold">{{ wrapped.year }}</span>
        </template>
      </i18n-t>

      <i18n-t
        :aria-hidden="step < 1"
        class="text-3xl pt-10 text-right fade-slide"
        keypath="components.wrapped.final.wishes"
        scope="global"
        tag="h1"
      >
        <template #abc>
          <span class="font-bold">ABC</span>
        </template>
      </i18n-t>
    </div>

    <div v-if="!showArrows" class="flex flex-row fixed right-4 bottom-4 gap-2 items-center">
      <RouterLink :aria-hidden="step < 2" class="mb-10 fade-slide text-xl text-white" :to="{ name: 'home' }">
        {{ t('components.wrapped.final.back') }} <i class="ml-2 pi pi-external-link"></i>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse; showArrows?: boolean }>();

const { t } = useI18n();

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
