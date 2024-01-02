<template>
  <div class="flex flex-row flex-wrap w-full gap-1 w-full">
    <!-- Loop through each product and render a card for each -->
      <ProductComponent v-for="product in products" :product="product" />
  </div>
</template>

<script setup lang="ts">
import type { ProductResponse } from "@sudosos/sudosos-client";
import ProductComponent from "@/components/ProductComponent.vue";

defineProps({
  products: {
    type: Array<ProductResponse>,
    required: true,
  },
});

</script>

<style scoped>
</style>
