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
      <Message
        v-if="isCategoryAlcoholic && !useSettingStore().isAlcoholTime && pointOfSale?.useAuthentication"
        severity="warn"
      >
        Please note that today, alcoholic drinks are only allowed to be served after
        {{
          new Date(useSettingStore().alcoholTimeToday).toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit',
          })
        }}. This also applies to non-alcoholic alternatives on this page.
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
import { computed, nextTick, ref, watch } from 'vue';
import { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import ScrollPanel from 'primevue/scrollpanel';
import { useCartStore } from '@/stores/cart.store';
import PointOfSaleProductsComponent from '@/components/PointOfSaleDisplay/PointOfSaleProductsComponent.vue';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useSettingStore } from '@/stores/settings.store';

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
    (category: { name: string; id: string }) => category.name.toLowerCase() === target,
  );
  if (shouldShowAllCategory.value) return 'all';
  return nonAlcoholicCategory ? nonAlcoholicCategory.id : undefined;
}

const isCategoryAlcoholic = computed(() => {
  const category = computedCategories.value.find((c) => c.id == selectedCategoryId.value);
  return category?.name === 'Alcoholic';
});

const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId;
};

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

watch(
  () => props.pointOfSale,
  (newPos) => {
    if (newPos) selectedCategoryId.value = getDefaultCategoryId();
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
