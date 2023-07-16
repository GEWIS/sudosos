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
    <div class="container" v-for="container in filteredContainers" :key="container.id">
      <div class="products">
        <div class="product" v-for="product in container.products" :key="product.id">
          <ProductComponent :product="product" :container="container" />
        </div>
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
    type: Object as () => PointOfSaleWithContainersResponse,
    required: true,
  },
});

const pointOfSaleStore = usePointOfSaleStore();
const selectedCategoryId = ref<number | null>(getDefaultCategoryId());

const computedCategories = computed(() => {
  return pointOfSaleStore.allProductCategories;
});

const filteredContainers = computed(() => {
  if (!selectedCategoryId.value) {
    return props.pointOfSale.containers;
  }

  return props.pointOfSale.containers.map((container) => {
    const filteredProducts = container.products.filter(
      (product) => product.category.id === selectedCategoryId.value
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

const selectCategory = (categoryId: number) => {
  selectedCategoryId.value = categoryId;
};
</script>

<style scoped>
/* Your existing styles */
.point-of-sale {
  padding-top: 35px;
  padding-left: 60px;
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
  background-color: #eee;
  cursor: pointer;
  font-weight: bold;
  border-radius: 50px;
  padding: 13px;
  padding-left: 25px;
  padding-right: 25px;
}

.selected-category {
  background-color: var(--accent-color); /* Replace with your desired background color for selected category */
  color: white;
}
</style>

export default {
name: "PointOfSaleComponent",
components: {
ProductComponent,
},
};
