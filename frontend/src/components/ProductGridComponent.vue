<template>
  <div class="flex flex-row flex-wrap w-full gap-1 w-full">
    <!-- Loop through each product and render a card for each -->

    <div v-for="product in products" :key="product.id" class="card">
      <ProductComponent :product="product" />
    </div>
    <div class="flex text-center w-8rem h-10rem m-2 border-1 border-round-md border-500
    flex-column align-items-center">
      <i class="pi pi-plus text-5xl my-auto"></i>
      <p class="w-100 product-name mb-0 p-2 font-bold">{{ "Add product" }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductResponse } from "@sudosos/sudosos-client";
import ProductComponent from "@/components/ProductComponent.vue";
import { getProductImageSrc } from "@/utils/imageUtils";

defineProps({
  products: {
    type: Array<ProductResponse>,
    required: true,
  },
});

</script>

<style scoped>
</style>
