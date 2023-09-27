<template>
  <div class="text-center product-card" @click="visible = true">
    <div class="product">
      <img :src="getProductImageSrc(product)" :alt="product.name" />
      <p class="w-100 product-name mb-0">{{ product.name }}</p>
    </div>
  </div>
  <ProductDialogComponent v-model:visible="visible" :product="product"/>
</template>

<script setup lang="ts">
import type { ProductResponse } from "@sudosos/sudosos-client";
import { getProductImageSrc } from "@/utils/imageUtils";
import { ref } from "vue";
import ProductDialogComponent from "@/components/ProductDialogComponent.vue";

const visible = ref(false);

defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.product-card {
  height: 9.5rem;
  width: 8rem;
  overflow: hidden;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box; /* Include padding and border in the .card's width */

  .product {
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
