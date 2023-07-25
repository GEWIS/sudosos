<template>
  <div class="point-of-sale">
    <div class="header">
      <div class="search-container" v-show="isSearchViewVisible">
        <input type="text" id="searchInput" v-model="searchQuery" placeholder="Search..." />
        <div class="search-button" @click="closeSearchView">
          <font-awesome-icon class="icon" icon="fa-solid fa-xmark" /> Search
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
        <label htmlFor="searchInput" class="search-button" @click="openSearchView">
          <font-awesome-icon icon="fa-solid fa-search" />
          Search
        </label>
      </div>
    </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, ComputedRef } from 'vue';
import {
  ContainerWithProductsResponse,
  PointOfSaleWithContainersResponse,
  ProductResponse
} from '@sudosos/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';
import ProductComponent from '@/components/ProductComponent.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Fuse from 'fuse.js';

const props = defineProps({
  pointOfSale: {
    type: Object as () => PointOfSaleWithContainersResponse | undefined,
    required: true
  }
});

const pointOfSaleStore = usePointOfSaleStore();
const selectedCategoryId = ref<string | null>(getDefaultCategoryId());
const storedSelectedCategoryId = ref<string | null>(null);
const searchQuery = ref('');
const isSearchViewVisible = ref(false);

watch(searchQuery, () => {
  // Reset the selected category when a new search query is entered
  selectedCategoryId.value = null;
});

const openSearchView = () => {
  storedSelectedCategoryId.value = selectedCategoryId.value;
  isSearchViewVisible.value = true;
};

const closeSearchView = () => {
  selectedCategoryId.value = storedSelectedCategoryId.value;
  isSearchViewVisible.value = false;
  searchQuery.value = '';
};

const computedCategories = computed(() => {
  return pointOfSaleStore.allProductCategories;
});

function getDefaultCategoryId() {
  const nonAlcoholicCategory = pointOfSaleStore.allProductCategories.find(
    (category) => category.name.toLowerCase() === 'non-alcoholic'
  );

  return nonAlcoholicCategory ? nonAlcoholicCategory.id : null;
}

const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId;
};
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

  if (selectedCategoryId.value && !isSearchViewVisible.value) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.product.category.id === Number(selectedCategoryId.value);
    });
  }

  if (isSearchViewVisible.value) {
    if (searchQuery.value === '') return filteredProducts;

    if (searchQuery.value) {
      filteredProducts = new Fuse(filteredProducts, {
        keys: ['product.name'],
        isCaseSensitive: false,
        shouldSort: true,
        threshold: 0.2
      })
        .search(searchQuery.value)
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
.point-of-sale {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  margin-right: 35px;
  height: 72px;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category,
.search-button {
  font-size: 22px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 50px;
  padding: 13px 25px;
}

.selected-category,
.search-button {
  background-color: var(--accent-color);
  color: white;
}

.categories-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.search-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
  height: 72px;

  > .search-button > .icon {
    text-align: center;
    line-height: 55px;
    font-size: 35px;
    vertical-align: bottom;
  }

  > input,
  input:focus {
    height: 55px;
    border: none;
    border-radius: 10px;
    font-size: 22px;
    padding: 10px;
    color: var(--accent-color);
    outline-color: var(--accent-color);
  }
}

.container-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  margin-bottom: 20px;
  margin-right: 20px;
  scrollbar-color: var(--accent-color) rgba(135, 135, 135, 0.3);
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
  padding-bottom: 20px;
  padding-right: 50px;
}
</style>
