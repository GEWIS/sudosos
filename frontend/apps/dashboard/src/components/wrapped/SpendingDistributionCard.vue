<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="bg chart-bg">
      <i aria-hidden="true" class="pi pi-chart-line"></i>
    </div>
    <div class="content">
      <h1 class="text-2xl">
        Of the <span class="font-bold">{{ formatDineroObject(wrapped.totalSpent) }}</span> you spent,
        <span class="font-bold">{{ formatDineroObject(wrapped.borrelSpent) }}</span>
        was spent during borrels.
      </h1>
      <h2 :aria-hidden="step < 1" class="text-2xl pt-2 fade-slide">
        That is <span class="font-bold">{{ share(wrapped.borrelSpent) }}</span
        >!
      </h2>

      <div class="pt-6">
        <h1 :aria-hidden="step < 2" class="text-xl fade-slide">
          In <span class="font-bold">{{ wrapped.year }}</span
          >, you spent:
        </h1>
        <ul>
          <li
            v-for="(category, index) in categories"
            :key="category.id"
            :aria-hidden="step < index + 3"
            class="fade-slide"
          >
            <span class="font-bold">
              {{ formatDineroObject(category.totalInclVat) }} ({{ share(category.totalInclVat) }})
            </span>
            on {{ category.name }}.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DineroObjectResponse, WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { formatDineroObject } from '@/utils/formatterUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

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
