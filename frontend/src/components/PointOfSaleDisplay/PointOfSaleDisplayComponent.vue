<template>
  <div class="point-of-sale">
    <div class="header">
      <div class="search-container" v-show="isSearchViewVisible">
        <input type="text" id="searchInput" v-model="searchQuery" placeholder="Search..."/>
        <div class="search-button" @click="closeSearchView">
          <font-awesome-icon class="icon" icon="fa-solid fa-xmark"/>
          Search
        </div>
      </div>
      <div v-show="!isSearchViewVisible" class="categories-header">
          <PointOfSaleCategoriesComponent v-model:category="selectedCategoryId"/>
        <label htmlFor="searchInput" class="search-button" @click="openSearchView">
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
import { ref, watch } from 'vue';
import {
  PointOfSaleWithContainersResponse
} from '@sudosos/sudosos-client';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useCartStore } from "@/stores/cart.store";
import PointOfSaleProductsComponent from "@/components/PointOfSaleDisplay/PointOfSaleProductsComponent.vue";
import PointOfSaleCategoriesComponent from "@/components/PointOfSaleDisplay/PointOfSaleCategoriesComponent.vue";

defineProps({
  pointOfSale: {
    type: Object as () => PointOfSaleWithContainersResponse | undefined,
    required: true
  }
});

const cartStore = useCartStore();
const selectedCategoryId = ref<string | undefined>(undefined);
const searchQuery = ref('');
const isSearchViewVisible = ref(false);

const openSearchView = () => {
  isSearchViewVisible.value = true;
};

const closeSearchView = () => {
  isSearchViewVisible.value = false;
  searchQuery.value = '';
};

watch(
  () => cartStore.cartTotalCount,
  () => {
    if (isSearchViewVisible.value) closeSearchView();
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
</style>
