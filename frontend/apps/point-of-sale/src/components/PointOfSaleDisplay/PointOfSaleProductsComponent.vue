<template>
  <div ref="wrapper" class="container-grid-wrapper flex-1 mb-2 mr-0 pl-1 pr-6">
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
import { ref, watch } from 'vue';
import { PointOfSaleWithContainersResponse } from '@gewis/sudosos-client';
import ProductComponent from '@/components/ProductComponent.vue';
import { usePosProducts } from '@/composables/usePosProducts';

const props = defineProps<{
  isProductSearch: boolean;
  pointOfSale?: PointOfSaleWithContainersResponse;
  selectedCategoryId?: string;
  searchQuery: string;
}>();

const wrapper = ref();

const { sortedProducts } = usePosProducts({
  pointOfSale: () => props.pointOfSale,
  selectedCategoryId: () => props.selectedCategoryId,
  isProductSearch: () => props.isProductSearch,
  searchQuery: () => props.searchQuery,
});

watch(sortedProducts, () => {
  wrapper.value?.scrollTo(0, 0);
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
</style>
