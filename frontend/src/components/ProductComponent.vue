<template>
  <div
    class="flex flex-column h-10rem w-8rem border-300 border-1 border-round-sm overflow-hidden"
    @click="visible = true"
  >
    <div class="flex align-items-center justify-content-center h-8rem w-full bg-white overflow-hidden">
      <img :src="getProductImageSrc(product)" :alt="product.name" class="max-w-full max-h-full object-contain" />
    </div>
    <p class="text-center m-0 text-base text-overflow-ellipsis font-bold">{{ product.name }}</p>
  </div>
  <ProductDialogComponent :container="container" v-model:visible="visible" :product="product" />
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse, ProductResponse } from "@sudosos/sudosos-client";
import { getProductImageSrc } from "@/utils/imageUtils";
import { ref } from "vue";
import ProductDialogComponent from "@/components/ProductDialogComponent.vue";

const visible = ref(false);

defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
  container: {
    type: Object as () => ContainerWithProductsResponse,
    required: true,
  }
});
</script>

<style scoped lang="scss">
</style>
