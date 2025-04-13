<template>
  <div ref="wrapper" class="container-grid-wrapper flex-1 h-full mb-3 mr-0 pl-1 pr-6">
    <div class="container gap-2">
      <ProductComponent
        v-for="product in sortedProducts"
        :key="`${product.product.id}-${product.container.id}`"
        :container="product.container"
        :product="product.product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import Fuse from 'fuse.js';
import ProductComponent from '@/components/ProductComponent.vue';

const props = defineProps<{
  isProductSearch: boolean;
  pointOfSale?: PointOfSaleWithContainersResponse;
  selectedCategoryId?: string;
  searchQuery: string;
}>();

const searchQuery = ref(props.searchQuery);
const wrapper = ref();

watch(
  () => props.searchQuery,
  (newValue) => {
    searchQuery.value = newValue;
  },
  { immediate: true },
);

const getFilteredProducts = () => {
  if (!props.pointOfSale) return [];
  wrapper.value?.scrollTo(0, 0);

  let filteredProducts = props.pointOfSale.containers.flatMap((container) => {
    return container.products.map((product) => ({
      product,
      container,
    }));
  });

  if (props.selectedCategoryId && props.selectedCategoryId !== 'all' && !props.isProductSearch) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.product.category.id === Number(props.selectedCategoryId);
    });
  }

  if (props.isProductSearch) {
    if (searchQuery.value === '') return filteredProducts;

    if (props.searchQuery) {
      filteredProducts = new Fuse(filteredProducts, {
        keys: ['product.name'],
        isCaseSensitive: false,
        shouldSort: true,
        threshold: 0.2,
      })
        .search(searchQuery.value)
        .map((r) => r.item);
    }
  }

  return filteredProducts;
};

const filteredProducts = computed(() => {
  return getFilteredProducts();
});

const sortedProducts = computed(() => {
  const products = [...filteredProducts.value];

  products.sort((a, b) => {
    // Prioritize 'preferred', then sort alphabetically
    if (a.product.preferred && !b.product.preferred) {
      return -1;
    } else if (!a.product.preferred && b.product.preferred) {
      return 1;
    }

    // If category is 'all', first also sort by categoryId
    if (props.selectedCategoryId === 'all') {
      if (a.product.category.id < b.product.category.id) {
        return -1;
      } else if (a.product.category.id > b.product.category.id) {
        return 1;
      }
    }

    const nameA = a.product.name.toLowerCase();
    const nameB = b.product.name.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return products;
});
</script>

<style scoped lang="scss">
.container-grid-wrapper {
  overflow-y: auto;
  scrollbar-color: var(--accent-color) rgba(135, 135, 135, 0.3);

  > .container {
    grid-template-columns: repeat(auto-fill, minmax($product-column-width, 1fr));
    display: grid;
  }
}
</style>
