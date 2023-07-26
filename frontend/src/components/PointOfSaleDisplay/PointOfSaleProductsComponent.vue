<template>
  <div class="container-grid-wrapper">
    <div class="container">
      <ProductComponent
          v-for="product in sortedProducts"
          :key="product.product.id"
          :product="product.product"
          :container="product.container"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef } from "vue";
import {
  ContainerWithProductsResponse,
  PointOfSaleWithContainersResponse,
  ProductResponse
} from "@sudosos/sudosos-client";
import Fuse from "fuse.js";
import ProductComponent from "@/components/ProductComponent.vue";

const props = defineProps({
  isProductSearch: {
    type: Boolean,
    required: true,
  },
  pointOfSale: {
    type: Object as () => PointOfSaleWithContainersResponse | undefined,
    required: true,
  },
  selectedCategoryId: {
    type: String,
    required: false,
  },
  searchQuery: {
    type: String,
    required: true,
  },
});

const filteredProducts: ComputedRef<
    { product: ProductResponse; container: ContainerWithProductsResponse }[]
> = computed(() => {
  if (!props.pointOfSale) return [];

  let filteredProducts = props.pointOfSale.containers.flatMap((container) => {
    return container.products.map((product) => ({
      product,
      container
    }));
  });

  if (props.selectedCategoryId && !props.isProductSearch) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.product.category.id === Number(props.selectedCategoryId);
    });
  }

  if (props.isProductSearch) {
    if (props.searchQuery === '') return filteredProducts;

    if (props.searchQuery) {
      filteredProducts = new Fuse(filteredProducts, {
        keys: ['product.name'],
        isCaseSensitive: false,
        shouldSort: true,
        threshold: 0.2
      })
          .search(props.searchQuery)
          .map((r) => r.item);
    }
  }

  return filteredProducts;
});

const sortedProducts = computed(() => {
  const products = [...filteredProducts.value];

  products.sort((a, b) => {
    const nameA = a.product.name.toLowerCase();
    const nameB = b.product.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return products;
});
</script>

<style scoped>
.container-grid-wrapper {
  flex: 1;
  height: 100%;
  margin-bottom: 20px;
  margin-right: 20px;
  overflow-y: auto;
  scrollbar-color: var(--accent-color) rgba(135, 135, 135, 0.3);

  > .container {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    padding-bottom: 20px;
    padding-right: 50px;
  }
}
</style>
