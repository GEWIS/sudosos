<template>
  <div class="grid">
    <!-- Loop through each product and render a card for each -->
    <div v-for="product in products" :key="product.id" class="card">
      <ProductComponent :product="product" class="card"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductResponse } from "@sudosos/sudosos-client";
import { onMounted } from "vue";
import ProductComponent from "@/components/ProductComponent.vue";

const props = defineProps({
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

.card {
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden; /* Ensure the content inside the .card does not overflow */
  box-sizing: border-box; /* Include padding and border in the .card's width */
}
</style>
