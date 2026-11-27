<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg flex justify-center items-center">
      <i aria-hidden="true" class="pi pi-shopping-cart icon"></i>
    </div>
    <div class="content w-full">
      <h2 class="text-xl">{{ t('components.wrapped.round.title') }}</h2>
      <h1 class="text-2xl">
        <span class="pop text-6xl font-black">{{ round.items }}</span>
        {{ t('components.wrapped.round.items', round.items) }}
      </h1>
      <i18n-t
        :aria-hidden="step < 1"
        class="text-xl pt-2 fade-slide"
        keypath="components.wrapped.round.details"
        scope="global"
        tag="h2"
      >
        <template #amount>
          <span class="font-bold">{{ formatDineroObject(round.totalInclVat) }}</span>
        </template>
      </i18n-t>
      <p :aria-hidden="step < 2" class="text-lg pt-6 fade-slide first-letter:uppercase">
        {{ date }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { formatDineroObject } from '@/utils/formatterUtils';
import { formatDate } from '@/utils/wrappedUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t, locale } = useI18n();

const round = computed(() => props.wrapped.biggestRound!);
const date = computed(() =>
  formatDate(new Date(round.value.date), locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }),
);

const { step } = useCardReveal(() => props.active, [1000, 1000]);
</script>

<style scoped>
.icon {
  font-size: 16rem;
  color: rgba(255, 255, 255, 0.15);
  transform: rotate(-10deg);
}
</style>
