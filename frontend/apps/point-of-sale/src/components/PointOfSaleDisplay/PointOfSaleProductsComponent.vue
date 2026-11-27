<template>
  <div v-if="compact" class="product-list mb-2">
    <!-- Rows look like cart lines, so far more products fit on a phone screen. -->
    <CartItemComponent
      v-for="product in sortedProducts"
      :key="`${product.product.id}-${product.container.id}`"
      :cart-product="cartLine(product)"
      listing
    />
  </div>
  <div v-else ref="wrapper" class="container-grid-wrapper flex-1 mb-2 mr-0 pl-1 pr-6">
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
import {
  ContainerWithProductsResponse,
  PointOfSaleWithContainersResponse,
  ProductResponse,
} from '@gewis/sudosos-client';
import Fuse from 'fuse.js';
import ProductComponent from '@/components/ProductComponent.vue';
import CartItemComponent from '@/components/Cart/CartItemComponent.vue';
import { CartProduct, useCartStore } from '@/stores/cart.store';

const props = defineProps<{
  isProductSearch: boolean;
  pointOfSale?: PointOfSaleWithContainersResponse;
  selectedCategoryId?: string;
  searchQuery: string;
  compact?: boolean;
}>();

const cartStore = useCartStore();

// The cart line for a listed product, so its row shows the quantity already ordered.
const cartLine = (item: { product: ProductResponse; container: ContainerWithProductsResponse }): CartProduct =>
  cartStore.products.find(
    (p) =>
      p.container.id === item.container.id &&
      p.product.id === item.product.id &&
      p.product.revision === item.product.revision,
  ) ?? { ...item, count: 0 };

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
        threshold: 0.3,
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
  > .container {
    display: grid;
    grid-template-columns: repeat(auto-fill, 145px);
    justify-content: space-evenly;
  }
}

.product-list > * + * {
  border-top: 1px solid var(--p-surface-200);
  padding-top: 0.25rem;
}
</style>
