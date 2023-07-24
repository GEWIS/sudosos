<template>
  <div class="text-center product-card">
    <div class="product">
      <img :src="getProductImageSrc(product)" :alt="product.name" />
      <p class="w-100 product-name mb-0">{{ product.name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductResponse } from "@sudosos/sudosos-client";
import { getProductImageSrc } from "@/utils/imageUtils";

defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.product-card {
  border-radius: 4px;
  overflow: hidden;
  text-align: center;
  height: 100%;

  .product {
    height: 100%;
    display: flex;
    flex-direction: column; /* Align items vertically */
    justify-content: space-between;
    > img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
  }
}

.product-name {
  font-weight: bold;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
