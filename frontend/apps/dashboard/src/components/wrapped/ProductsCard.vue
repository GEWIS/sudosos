<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h2 class="text-2xl font-bold mb-5">{{ t('components.wrapped.products.title') }}</h2>
      <div class="grid gap-2">
        <div
          v-for="(product, index) in wrapped.topProducts"
          :key="product.id"
          :aria-hidden="step <= index"
          class="w-full flex flex-row items-center p-2 rounded-lg bg-white/30 fade-slide"
        >
          <div class="flex-shrink-0 w-16 h-16 mr-2 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              :alt="product.name"
              class="w-full h-full object-contain"
              :src="getProductImageSrcFromString(product.image ?? '')"
            />
          </div>
          <div class="w-full">
            <h3 class="font-bold text-xl">{{ product.name }}</h3>
            <i18n-t keypath="components.wrapped.products.bought" :plural="product.count" scope="global" tag="h4">
              <template #count>
                <span class="font-bold">{{ product.count.toLocaleString(locale) }}</span>
              </template>
            </i18n-t>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { getProductImageSrcFromString } from '@/utils/urlUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t, locale } = useI18n();

const { step } = useCardReveal(
  () => props.active,
  props.wrapped.topProducts.map((_, index) => (index === 0 ? 500 : 800)),
);
</script>
