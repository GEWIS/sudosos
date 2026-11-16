<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h2 class="text-2xl mb-5">
        In <span class="font-bold">{{ wrapped.year }}</span
        >, your favorite product was:
      </h2>
      <PosProduct
        class="w-[70%] ml-auto mr-auto -rotate-5"
        :class="step >= 1 ? 'slide-in' : 'invisible'"
        :image="getProductImageSrcFromString(product.image ?? '')"
        :name="product.name"
      />
      <h3 :aria-hidden="step < 2" class="mt-8 text-xl fade-slide float-right">
        You bought this item <span class="font-bold">{{ product.count }}</span> time{{ product.count == 1 ? '' : 's' }}!
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WrappedResponse } from '@gewis/sudosos-client';
import PosProduct from '@/components/wrapped/Product/PosProduct.vue';
import { useCardReveal } from '@/composables/wrappedCard';
import { getProductImageSrcFromString } from '@/utils/urlUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const product = computed(() => props.wrapped.topProducts[0]);

const { step } = useCardReveal(() => props.active, [500, 1500]);
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
