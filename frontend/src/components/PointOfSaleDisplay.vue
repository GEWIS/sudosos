<template>
  <div class="point-of-sale">
    <div class="container" v-for="container in pointOfSale.containers" :key="container.id">
      <h3>{{ container.name }}</h3>
      <div class="products">
        <div class="product" v-for="product in container.products" :key="product.id">
          <ProductComponent :product="product"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PointOfSaleWithContainersResponse } from "sudosos-client";
import ProductComponent from "@/components/ProductComponent.vue";

const props = defineProps({
  pointOfSale: {
    type: Object as () => PointOfSaleWithContainersResponse,
    required: true,
  },
});
</script>

<style scoped>
.point-of-sale {
  display: flex;
  flex-wrap: wrap;
}

.container {
  margin-bottom: 20px;
}

.products {
  display: flex;
  flex-wrap: wrap;
}

.product {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.product-image {
  width: 100px;
  height: 100px;
  margin-right: 10px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  display: flex;
  flex-direction: column;
}

.product-details h4 {
  margin: 0;
}

.product-price {
  color: #888;
}
</style>
