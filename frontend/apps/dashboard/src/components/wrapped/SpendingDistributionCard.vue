<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg chart-bg">
      <i aria-hidden="true" class="pi pi-chart-line"></i>
    </div>
    <div class="content">
      <i18n-t class="text-2xl" keypath="components.wrapped.distribution.borrel" scope="global" tag="h1">
        <template #total>
          <span class="font-bold">{{ formatDineroObject(wrapped.totalSpent) }}</span>
        </template>
        <template #borrel>
          <span class="font-bold">{{ formatDineroObject(wrapped.borrelSpent) }}</span>
        </template>
      </i18n-t>
      <i18n-t
        :aria-hidden="step < 1"
        class="text-2xl pt-2 fade-slide"
        keypath="components.wrapped.distribution.share"
        scope="global"
        tag="h2"
      >
        <template #share>
          <span class="font-bold">{{ share(wrapped.borrelSpent) }}</span>
        </template>
      </i18n-t>

      <div class="pt-6">
        <h1 :aria-hidden="step < 2" class="text-xl fade-slide">
          {{ t('components.wrapped.distribution.categories') }}
        </h1>
        <ul>
          <li
            v-for="(category, index) in categories"
            :key="category.id"
            :aria-hidden="step < index + 3"
            class="fade-slide"
          >
            {{
              t('components.wrapped.distribution.category', {
                amount: formatDineroObject(category.totalInclVat),
                share: share(category.totalInclVat),
                category: category.name,
              })
            }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DineroObjectResponse, WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { formatDineroObject } from '@/utils/formatterUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t } = useI18n();

const categories = computed(() => props.wrapped.categories.slice(0, 3));

const { step } = useCardReveal(() => props.active, [1000, 1000, ...categories.value.map(() => 800)]);

function share(part: DineroObjectResponse): string {
  const total = props.wrapped.totalSpent.amount;
  return `${total === 0 ? 0 : Math.round((part.amount / total) * 100)}%`;
}
</script>

<style scoped lang="scss">
.chart-bg {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-bg .pi {
  font-size: 18rem;
  color: rgba(255, 255, 255, 0.2);
  transform: rotate(-6deg);
}
</style>
