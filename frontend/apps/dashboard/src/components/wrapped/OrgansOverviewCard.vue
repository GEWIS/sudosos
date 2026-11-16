<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h2 class="text-2xl font-bold mb-5">{{ t('components.wrapped.organs.title') }}</h2>
      <div class="grid gap-2">
        <div
          v-for="(organ, index) in wrapped.organs"
          :key="organ.organId"
          :aria-hidden="step <= index"
          class="w-full p-2 rounded-lg fade-slide"
          :class="organ === bestOrgan(wrapped) ? 'bg-white/50 border-2 border-white/60' : 'bg-white/30'"
        >
          <h3 class="font-bold text-xl">{{ organName(organ) }}</h3>
          <i18n-t keypath="components.wrapped.organs.summary" scope="global" tag="h4">
            <template #seller>
              <span class="font-bold">{{ organ.ordinalTurnoverCreated + 1 }}</span>
            </template>
            <template #transactions>
              <span class="font-bold">{{ organ.ordinalTransactionCreated + 1 }}</span>
            </template>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { bestOrgan, organName } from '@/utils/wrappedUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t } = useI18n();

const { step } = useCardReveal(
  () => props.active,
  props.wrapped.organs.map((_, index) => (index === 0 ? 500 : 800)),
);
</script>
