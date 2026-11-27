<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h1 class="text-4xl font-bold">{{ t('components.wrapped.quiet.title') }}</h1>
      <h2 class="text-xl pt-4">{{ t('components.wrapped.quiet.text', { year: wrapped.year }) }}</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t } = useI18n();

useCardReveal(() => props.active, []);
</script>
