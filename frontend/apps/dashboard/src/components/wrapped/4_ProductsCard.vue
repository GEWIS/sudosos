<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h2 class="text-2xl mb-5">Your <span class="font-bold">top products</span> were:</h2>
      <div class="grid gap-2">
        <div
          v-for="(product, index) in topFiveProducts"
          :key="product.product.id"
          :aria-hidden="!isRevealed(index)"
          class="w-full flex flex-row items-center p-2 rounded-lg bg-red-50 item fade-slide"
          :style="{ backgroundColor: 'rgba(255,255,255,0.3)' }"
        >
          <div class="flex-shrink-0 w-16 h-16 mr-2 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              :alt="product.product.name"
              class="w-full h-full object-contain"
              :src="productImages[index] || 'https://via.placeholder.com/150'"
            />
          </div>
          <div class="w-full">
            <h3 class="font-bold text-xl">{{ product.product.name }}</h3>
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
import { defineProps, toRef, ref, watch, computed, type ComputedRef, unref } from 'vue';
import type { ReportProductEntryResponse } from '@sudosos/sudosos-client';
import { getProductImageSrcFromString } from '@/utils/urlUtils';

const props = defineProps<{
  active?: boolean;
  topFiveProducts: ComputedRef<ReportProductEntryResponse[]> | ReportProductEntryResponse[];
}>();
const topFiveProducts = computed<ReportProductEntryResponse[]>(() => {
  const p = unref(props.topFiveProducts);
  if (!p) {
    return [
      {
        product: {
          name: '',
          priceInclVat: { amount: 0 },
        },
        image: '',
        count: 0,
      },
    ] as ReportProductEntryResponse[];
  }
  return p;
});

const productImages = computed(() =>
  topFiveProducts.value.map((product) => getProductImageSrcFromString(product.image ?? '')),
);
const active = toRef(props, 'active');

const revealed = ref(new Set<number>());
let animationToken = 0;
const REVEAL_INTERVAL = 800;
const FIRST_REVEAL_DELAY = 500;
const hasPlayed = ref(false);

function isRevealed(index: number) {
  return revealed.value.has(index);
}

function resetAnimationState() {
  animationToken++;
  revealed.value = new Set<number>();
  hasPlayed.value = false;
}

async function runAnimation(token: number) {
  await new Promise((res) => setTimeout(res, FIRST_REVEAL_DELAY));
  if (token !== animationToken) return;

  for (let i = 0; i < topFiveProducts.value.length; i++) {
    if (token !== animationToken) return;
    revealed.value.add(i);
    await new Promise((res) => setTimeout(res, REVEAL_INTERVAL));
  }
  if (token !== animationToken) return;
  hasPlayed.value = true;
}

watch(
  active,
  (v) => {
    if (v) {
      if (!hasPlayed.value) {
        resetAnimationState();
        const token = animationToken;
        setTimeout(() => void runAnimation(token), 40);
      } else {
        revealed.value = new Set(topFiveProducts.value.map((_, i) => i));
      }
    }
  },
  { immediate: false },
);
</script>
<style scoped lang="scss"></style>
