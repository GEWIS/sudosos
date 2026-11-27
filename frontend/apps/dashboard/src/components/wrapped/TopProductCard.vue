<template>
  <div class="card-root text-white" :class="{ active }">
    <WrappedConfetti v-if="active && product.rank === 1 && step >= 3" />
    <div class="content">
      <h2 class="text-2xl mb-5">{{ t('components.wrapped.topProduct.intro', { year: wrapped.year }) }}</h2>
      <PosProduct
        class="w-[70%] ml-auto mr-auto -rotate-5"
        :class="step >= 1 ? 'slide-in' : 'invisible'"
        :image="getProductImageSrcFromString(product.image ?? '')"
        :name="product.name"
      />
      <i18n-t
        :aria-hidden="step < 2"
        class="mt-8 text-xl fade-slide text-right"
        keypath="components.wrapped.topProduct.bought"
        :plural="product.count"
        scope="global"
        tag="h3"
      >
        <template #count>
          <span class="font-bold">{{ product.count.toLocaleString(locale) }}</span>
        </template>
      </i18n-t>
      <p v-if="product.rank <= PODIUM" :aria-hidden="step < 3" class="mt-4 text-lg fade-slide text-right">
        {{
          product.rank === 1
            ? t('components.wrapped.topProduct.champion')
            : t('components.wrapped.topProduct.rank', { rank: product.rank })
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import PosProduct from '@/components/wrapped/Product/PosProduct.vue';
import WrappedConfetti from '@/components/wrapped/WrappedConfetti.vue';
import { useCardReveal } from '@/composables/wrappedCard';
import { getProductImageSrcFromString } from '@/utils/urlUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { t, locale } = useI18n();

const PODIUM = 3;

const product = computed(() => props.wrapped.topProducts[0]);

const { step } = useCardReveal(() => props.active, [500, 1500, 1000]);
</script>

<style scoped lang="scss">
@keyframes slideIn {
  from {
    transform: translateY(100vh) rotate(30deg);
    opacity: 0;
  }
  to {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 1000ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
</style>
