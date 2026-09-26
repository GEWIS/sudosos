<template>
  <div class="flex flex-col h-full">
    <div class="header min-h-[4rem] flex items-center">
      <div v-show="isSearchViewVisible">
        <div class="flex flex-row gap-4">
          <Button class="border-none" @click="closeSearchView">
            <i class="pi pi-times" style="font-size: 2rem" />
          </Button>
          <input
            id="searchInput"
            ref="searchInput"
            v-model="searchQuery"
            autocomplete="off"
            class="shadow-md p-2 rounded border-2 border-transparent search-input"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>
      <div v-show="!isSearchViewVisible">
        <div class="flex justify-between w-full">
          <div class="flex flex-wrap gap-4">
            <Button class="icon-md border-none" for="searchInput" outlined @click="openSearchView">
              <i class="pi pi-search" style="font-size: 2rem" />
            </Button>
            <Button
              v-for="category in computedCategories"
              :key="category.id"
              class="text-lg px-5 border-none shadow-sm"
              :outlined="category.id !== selectedCategoryId"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div class="m-2 mr-6">
      <Message v-if="shouldShowAlcoholWarning" severity="warn">
        Please note that today, alcoholic drinks are only allowed to be served after {{ alcoholTimeToday }}. This also
        applies to non-alcoholic alternatives on this page.
      </Message>
    </div>
    <div class="mr-6 h-full overflow-hidden">
      <ScrollPanel class="products-scroll-panel" style="width: 100%; height: 100%">
        <PointOfSaleProductsComponent
          :is-product-search="isSearchViewVisible"
          :point-of-sale="pointOfSale"
          :search-query="searchQuery"
          :selected-category-id="selectedCategoryId"
        />
      </ScrollPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { PointOfSaleWithContainersResponse } from '@gewis/sudosos-client';
import ScrollPanel from 'primevue/scrollpanel';
import { useCartStore } from '@/stores/cart.store';
import PointOfSaleProductsComponent from '@/components/PointOfSaleDisplay/PointOfSaleProductsComponent.vue';
import { usePosCategories } from '@/composables/usePosCategories';

const props = defineProps({
  pointOfSale: {
    type: Object as () => PointOfSaleWithContainersResponse | undefined,
    required: true,
  },
});

const cartStore = useCartStore();
const searchQuery = ref('');
const isSearchViewVisible = ref(false);
const searchInput = ref<null | HTMLInputElement>(null);

const { computedCategories, selectedCategoryId, selectCategory, shouldShowAlcoholWarning, alcoholTimeToday } =
  usePosCategories(() => props.pointOfSale);

const openSearchView = async () => {
  isSearchViewVisible.value = true;
  await nextTick();
  searchInput.value?.focus();
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
  },
);
</script>

<style scoped lang="scss">
.header > div {
  width: 100%;
}

.search-input {
  &:focus {
    outline: none;
    border: 2px solid var(--p-primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-primary-color) 20%, transparent);
  }
}

::v-deep(.products-scroll-panel .p-scrollpanel-wrapper) {
  border-right: 20px solid #e0e0e0;
}

::v-deep(.products-scroll-panel .p-scrollpanel-bar) {
  background-color: var(--p-primary-color);
  opacity: 1;
  transition: background-color 0.3s;
  width: 20px;
}

::v-deep(.products-scroll-panel .p-scrollpanel-bar:hover) {
  background-color: var(--p-primary-color);
  filter: brightness(0.85);
}
</style>
