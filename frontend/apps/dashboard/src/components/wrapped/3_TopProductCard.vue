<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h2 class="text-2xl mb-5">In <span class="font-bold">2025</span>, your favorite product was:</h2>
      <PosProduct
        class="w-[70%] ml-auto mr-auto -rotate-5"
        :class="{ animated, 'pos-pre-enter': active && !animated }"
        :image="productImage"
        :name="product.product.name"
        :price="productPrice"
      />
      <h3 :aria-hidden="!showText" class="mt-8 text-xl fade-slide float-right">
        You bought this item <span class="font-bold">{{ product.count }}</span> time{{ product.count == 1 ? '' : 's' }}!
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef, ref, watch, onMounted, type ComputedRef, computed, unref } from 'vue';
import type { ReportProductEntryResponse } from '@sudosos/sudosos-client';
import PosProduct from '@/components/wrapped/Product/PosProduct.vue';
import { getProductImageSrcFromString } from '@/utils/urlUtils';

const props = defineProps<{
  active?: boolean;
  product: ComputedRef<ReportProductEntryResponse> | ReportProductEntryResponse;
}>();
const active = toRef(props, 'active');
const product = computed<ReportProductEntryResponse>(() => {
  const p = unref(props.product);
  if (!p) {
    return {
      product: {
        name: '',
        priceInclVat: { amount: 0 },
      },
      image: '',
      count: 0,
    } as ReportProductEntryResponse;
  }
  return p;
});

const productImage = getProductImageSrcFromString(product?.value.image ?? '');

const productPrice = computed(() => {
  const p = product.value;
  const amount = p?.product?.priceInclVat?.amount;
  return typeof amount === 'number' ? formatPrice(amount) : '';
});

const animated = ref(false);
const hasAnimated = ref(false);
const showText = ref(false);

const PRODUCT_ANIMATION_DELAY = 500;
const PRODUCT_ANIMATION_DURATION = 1000;
const TEXT_STAGGER = 500;

function triggerAnimationIfNeeded() {
  if (active.value && !hasAnimated.value) {
    hasAnimated.value = true;
    animated.value = false;
    showText.value = false;
    setTimeout(() => {
      animated.value = true;
      setTimeout(() => {
        showText.value = true;
      }, PRODUCT_ANIMATION_DURATION + TEXT_STAGGER);
    }, PRODUCT_ANIMATION_DELAY);
  }
}

watch(active, (newVal) => {
  if (newVal && !hasAnimated.value) {
    triggerAnimationIfNeeded();
  }
});

onMounted(() => {
  triggerAnimationIfNeeded();
});

function formatPrice(number: number) {
  return (number / 100).toFixed(2).replace('.', ',');
}
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

.animated {
  animation: slideIn 1000ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  will-change: transform, opacity;
}

.pos-pre-enter {
  transform: translateY(100vh) rotate(0deg);
  opacity: 0;
  will-change: transform, opacity;
}
</style>
