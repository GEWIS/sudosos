<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content w-full">
      <h2 class="text-xl">{{ t('components.wrapped.archetype.title') }}</h2>
      <h1 :aria-hidden="step < 1" class="pop text-5xl font-black pt-2 fade-slide">{{ archetype.title }}</h1>
      <p :aria-hidden="step < 2" class="text-xl pt-6 fade-slide">{{ archetype.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useWrappedArchetype } from '@/composables/wrappedArchetype';
import { useCardReveal } from '@/composables/wrappedCard';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t } = useI18n();

const archetype = useWrappedArchetype(() => props.wrapped);

const { step } = useCardReveal(() => props.active, [1500, 1000]);
</script>
