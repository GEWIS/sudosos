<template>
  <div class="grid">
    <!-- Loop through each product and render a card for each -->
    <div v-for="product in products" :key="product.id" class="card">
      <ProductComponent :product="product" />
    </div>
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
.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 20px;
}
</style>
