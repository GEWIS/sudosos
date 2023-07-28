<template>
  <div class="point-of-sale">
    <div class="header">
      <div class="search-container" v-show="isSearchViewVisible">
        <input type="text" ref="searchInput" id="searchInput" v-model="searchQuery" placeholder="Search..."/>
        <div class="search-button" @click="closeSearchView">
          <font-awesome-icon class="icon" icon="fa-solid fa-xmark"/>
          Search
        </div>
      </div>
      <div v-show="!isSearchViewVisible" class="categories-header">
        <div class="categories">
          <div
              class="category"
              v-for="category in computedCategories"
              :key="category.id"
              :class="{ 'selected-category': category.id === selectedCategoryId }"
              @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </div>
        </div>
        <label for="searchInput" class="search-button" @click="openSearchView">
          <font-awesome-icon icon="fa-solid fa-search"/>
          Search
        </label>
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useCartStore } from "@/stores/cart.store";
import PointOfSaleProductsComponent from "@/components/PointOfSaleDisplay/PointOfSaleProductsComponent.vue";
import { usePointOfSaleStore } from "@/stores/pos.store";

defineProps({
  pointOfSale: {
    type: Object as () => PointOfSaleWithContainersResponse | undefined,
    required: true
  }
});

const cartStore = useCartStore();
const selectedCategoryId = ref<string | undefined>(getDefaultCategoryId());
const searchQuery = ref('');
const isSearchViewVisible = ref(false);
const searchInput = ref(null);

const computedCategories = computed(() => {
  return usePointOfSaleStore().allProductCategories;
});

function getDefaultCategoryId(): string | undefined {
  const nonAlcoholicCategory = usePointOfSaleStore().allProductCategories.find(
      (category: {name: string, id: string}) => category.name.toLowerCase() === 'non-alcoholic'
  );

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
        if (isSearchViewVisible.value) {
          searchInput.value.select();
        }
      }
    }
);

</script>

<style scoped lang="scss">
.categories-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.search-container {
  display: flex;
  gap: 10px;
  height: 72px;
  justify-content: space-between;
  width: 100%;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  > .category {
    border-radius: 50px;
    cursor: pointer;
    font-size: 22px;
    margin-bottom: 10px;
    margin-right: 10px;
    padding: 13px 25px;

    &.selected-category {
      background-color: var(--accent-color);
      color: white;
    }
  }
}
</style>
