<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg flex justify-center items-center">
      <i aria-hidden="true" class="pi pi-wallet icon"></i>
    </div>
    <div class="content w-full">
      <h2 class="text-2xl font-bold">{{ t('components.wrapped.balance.title') }}</h2>
      <i18n-t
        v-if="wrapped.topUps.count > 0"
        :aria-hidden="step < 1"
        class="text-xl pt-4 fade-slide"
        keypath="components.wrapped.balance.topUps"
        :plural="wrapped.topUps.count"
        scope="global"
        tag="p"
      >
        <template #count>
          <span class="font-bold">{{ wrapped.topUps.count }}</span>
        </template>
        <template #total>
          <span class="font-bold">{{ formatDineroObject(wrapped.topUps.total) }}</span>
        </template>
      </i18n-t>
      <i18n-t
        v-if="wrapped.fines.count > 0"
        :aria-hidden="step < 2"
        class="text-xl pt-4 fade-slide"
        keypath="components.wrapped.balance.fines"
        :plural="wrapped.fines.count"
        scope="global"
        tag="p"
      >
        <template #count>
          <span class="font-bold">{{ wrapped.fines.count }}</span>
        </template>
        <template #total>
          <span class="font-bold">{{ formatDineroObject(wrapped.fines.total) }}</span>
        </template>
      </i18n-t>
      <p v-else :aria-hidden="step < 2" class="text-xl pt-4 fade-slide">
        {{ t('components.wrapped.balance.noFines') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { formatDineroObject } from '@/utils/formatterUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t } = useI18n();

const { step } = useCardReveal(() => props.active, [800, 1200]);
</script>

<style scoped>
.icon {
  font-size: 16rem;
  color: rgba(255, 255, 255, 0.15);
  transform: rotate(8deg);
}
</style>
