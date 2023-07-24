<template>
  <div class="point-of-sale">
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
    <div class="container-grid-wrapper">
      <div class="container">
        <ProductComponent
          v-for="product in products"
          :key="product.product.id"
          :product="product.product"
          :container="product.container"
        />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import { PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";
import { usePointOfSaleStore } from "@/stores/pos.store";
import ProductComponent from "@/components/ProductComponent.vue";

const props = defineProps({
  pointOfSale: {
    type: Object as () => PointOfSaleWithContainersResponse | undefined,
    required: true,
  },
});

const pointOfSaleStore = usePointOfSaleStore();
const selectedCategoryId = ref<string | null>(getDefaultCategoryId());

const computedCategories = computed(() => {
  return pointOfSaleStore.allProductCategories;
});

const filteredContainers = computed(() => {
  if (!props.pointOfSale) return [];

  if (!selectedCategoryId.value) {
    return props.pointOfSale.containers;
  }

  return props.pointOfSale.containers.map((container) => {

    const filteredProducts = container.products.filter(
      (product) => product.category.id === Number(selectedCategoryId.value)
    );
    return { ...container, products: filteredProducts };
  });
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

const products = computed(() => {
  return filteredContainers.value.flatMap((container) => {
    return container.products.map((product) => ({
      product,
      container,
    }));
  });
});
</script>

<style scoped>
.point-of-sale {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.category {
  font-size: 22px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 50px;
  padding: 13px;
  padding-left: 25px;
  padding-right: 25px;
}

.selected-category {
  background-color: var(--accent-color); /* Replace with your desired background color for selected category */
  color: white;
}

.container-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  margin-bottom: 20px;
  margin-right: 20px;
  scrollbar-color: var(--accent-color) rgba(135, 135, 135, 0.3);
}

/*.custom-scrollbar-container {*/
/*  scrollbar-color: #888 #f1f1f1;*/
/*  scrollbar-width: thin;*/
/*}*/

.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px; /* Reduce the gap value to 10px */
  padding-bottom: 20px; /* Add bottom padding to prevent the last row from being cut off */
  padding-right: 50px;
}
</style>
