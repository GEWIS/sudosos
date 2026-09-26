<template>
  <div class="flex flex-col">
    <div class="sticky top-0 z-10 bg-gray-50 px-3 pt-3 pb-2">
      <div class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          aria-label="Search products"
          autocomplete="off"
          class="w-full rounded-lg bg-white border-2 border-transparent shadow-sm py-2 pl-9 pr-9 search-input"
          enterkeyhint="search"
          placeholder="Search products..."
          type="text"
        />
        <button
          v-if="searchQuery"
          aria-label="Clear product search"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
          @click="searchQuery = ''"
        >
          <i class="pi pi-times" />
        </button>
      </div>
    </div>

    <Message v-if="shouldShowAlcoholWarning && !isProductSearch" class="mx-3 mb-2" severity="warn">
      Alcoholic drinks are only allowed to be served after {{ alcoholTimeToday }} today. This also applies to
      non-alcoholic alternatives in this category.
    </Message>

    <div class="rounded-xl overflow-hidden mx-3 shadow-sm">
      <MobileProductListItem
        v-for="item in sortedProducts"
        :key="`${item.product.id}-${item.container.id}`"
        :container="item.container"
        :product="item.product"
      />
    </div>
    <p v-if="sortedProducts.length === 0" class="text-center text-gray-500 py-8">No products found.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { PointOfSaleWithContainersResponse } from '@gewis/sudosos-client';
import MobileProductListItem from '@/components/Mobile/MobileProductListItem.vue';
import { usePosProducts } from '@/composables/usePosProducts';

const props = defineProps<{
  pointOfSale?: PointOfSaleWithContainersResponse;
  selectedCategoryId?: string;
  shouldShowAlcoholWarning?: boolean;
  alcoholTimeToday: string;
}>();

const searchQuery = ref('');
const isProductSearch = computed(() => searchQuery.value !== '');

const { sortedProducts } = usePosProducts({
  pointOfSale: () => props.pointOfSale,
  selectedCategoryId: () => props.selectedCategoryId,
  isProductSearch,
  searchQuery,
});

const clearSearch = () => {
  searchQuery.value = '';
};

defineExpose({ clearSearch });
</script>

<style scoped lang="scss">
.search-input {
  &:focus {
    outline: none;
    border-color: var(--p-primary-color);
  }
}
</style>
