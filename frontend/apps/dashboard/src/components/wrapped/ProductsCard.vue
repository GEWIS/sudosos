<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h2 class="text-2xl mb-5">Your <span class="font-bold">top products</span> were:</h2>
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
            <h4>
              Bought <span class="font-bold">{{ product.count }}</span> time{{ product.count == 1 ? '' : 's' }}!
            </h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { getProductImageSrcFromString } from '@/utils/urlUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { step } = useCardReveal(
  () => props.active,
  props.wrapped.topProducts.map((_, index) => (index === 0 ? 500 : 800)),
);
</script>
