<template>
  <div class="point-of-sale">
    <div class="header">
      <div v-show="isSearchViewVisible">
        <div class="header-row">
          <div class="c-btn square active icon-large search-close" @click="closeSearchView">
            <i class="pi pi-times text-4xl"/>
          </div>
          <input
            type="text"
            ref="searchInput"
            id="searchInput"
            v-model="searchQuery"
            placeholder="Search..."
            autocomplete="off"/>
        </div>
      </div>
      <div v-show="!isSearchViewVisible">
        <div class="flex w-full justify-content-between">
          <div class="flex flex-wrap gap-2">
            <label for="searchInput" class="c-btn icon-md search-close" @click="openSearchView">
              <i class="pi pi-search text-4xl"/>
            </label>
            <div
                class="c-btn rounder font-size-lg"
                v-for="category in computedCategories"
                :key="category.id"
                :class="{ 'active': category.id === selectedCategoryId }"
                @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </div>
          </div>
      </div>
      </div>
    </div>
    <PointOfSaleProductsComponent
        :search-query="searchQuery"
        :is-product-search="isSearchViewVisible"
        :point-of-sale="pointOfSale"
        :selected-category-id="selectedCategoryId"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  PointOfSaleWithContainersResponse
} from '@sudosos/sudosos-client';
import { useCartStore } from "@/stores/cart.store";
import PointOfSaleProductsComponent from "@/components/PointOfSaleDisplay/PointOfSaleProductsComponent.vue";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useSettingStore } from "@/stores/settings.store";

const props = defineProps({
  pointOfSale: {
    type: Object as () => PointOfSaleWithContainersResponse | undefined,
    required: true
  }
});

const cartStore = useCartStore();
const searchQuery = ref('');
const isSearchViewVisible = ref(false);
const searchInput = ref<null | HTMLInputElement>(null);
const AllCategory = { name: 'All', id: 'all' };
const productCount = computed(() => {
  if (!props.pointOfSale) return 0;
  const ids = new Set();
  props.pointOfSale.containers.forEach((container) => {
    return container.products.forEach((product) => {
      ids.add(product.id);
    });
  });
  return ids.size;
});

const shouldShowAllCategory = computed(() => {
  return props.pointOfSale && productCount.value <= 15;
});

const shouldOnlyShowAllCategory = computed(() => {
  return props.pointOfSale && productCount.value <= 5;
});

const selectedCategoryId = ref<string | undefined>(getDefaultCategoryId());

const computedCategories = computed(() => {
  if (shouldOnlyShowAllCategory.value) return [AllCategory];
  if (shouldShowAllCategory.value) return [AllCategory].concat(usePointOfSaleStore().allProductCategories);
  return usePointOfSaleStore().allProductCategories;
});

function getDefaultCategoryId(): string | undefined {
  // Different target category based on borrelmode or not.
  const target = useSettingStore().getTargetCategory;
  const nonAlcoholicCategory = usePointOfSaleStore().allProductCategories.find(
      (category: {name: string, id: string}) => category.name.toLowerCase() === target
  );
  if (shouldShowAllCategory.value) return 'all';
  return nonAlcoholicCategory ? nonAlcoholicCategory.id : undefined;
}

const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId;
};

const openSearchView = () => {
  isSearchViewVisible.value = true;
};

const closeSearchView = () => {
  isSearchViewVisible.value = false;
  searchQuery.value = '';
};

watch(
    () => cartStore.cartTotalCount,
    (newCount, oldCount) => {
      if (newCount > oldCount) {
        if (isSearchViewVisible.value && searchInput.value) {
          const len = searchInput.value.value.length;
          searchInput.value.setSelectionRange(0, len);
        }
      }
    }
);

watch(
    () => props.pointOfSale,
    (newPos) => {
      if (newPos) selectedCategoryId.value = getDefaultCategoryId();
    }
);

</script>

<style scoped lang="scss">
</style>
