<template>
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
</template>

<script setup lang="ts">
import { usePointOfSaleStore } from "@/stores/pos.store";
import { computed, ref } from "vue";

const props = defineProps({
  category: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(['update:category']);

const selectedCategoryId = ref<string | null>(getDefaultCategoryId());

const computedCategories = computed(() => {
  return usePointOfSaleStore().allProductCategories;
});

function getDefaultCategoryId() {
  const nonAlcoholicCategory = usePointOfSaleStore().allProductCategories.find(
      (category: {name: string, id: string}) => category.name.toLowerCase() === 'non-alcoholic'
  );

  return nonAlcoholicCategory ? nonAlcoholicCategory.id : null;
}

const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId;
  emit('update:category', categoryId);
};

</script>

<style scoped>
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
