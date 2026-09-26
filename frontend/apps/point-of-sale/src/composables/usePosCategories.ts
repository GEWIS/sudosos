import { computed, MaybeRefOrGetter, ref, toValue, watch } from 'vue';
import { PointOfSaleWithContainersResponse } from '@gewis/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useSettingStore } from '@/stores/settings.store';

export interface PosCategory {
  id: string;
  name: string;
}

const AllCategory: PosCategory = { name: 'All', id: 'all' };

/**
 * Category selection for a point of sale: which categories to offer, which one
 * is selected by default, and whether the alcohol-time warning applies.
 */
export function usePosCategories(pointOfSale: MaybeRefOrGetter<PointOfSaleWithContainersResponse | undefined>) {
  const posStore = usePointOfSaleStore();
  const settingStore = useSettingStore();

  const productCount = computed(() => {
    const pos = toValue(pointOfSale);
    if (!pos) return 0;
    const ids = new Set();
    pos.containers.forEach((container) => {
      return container.products.forEach((product) => {
        ids.add(product.id);
      });
    });
    return ids.size;
  });

  const shouldShowAllCategory = computed(() => {
    return toValue(pointOfSale) && productCount.value <= 15;
  });

  const shouldOnlyShowAllCategory = computed(() => {
    return toValue(pointOfSale) && productCount.value <= 5;
  });

  function getDefaultCategoryId(): string | undefined {
    // Different target category based on borrelmode or not.
    const target = settingStore.getTargetCategory;
    const nonAlcoholicCategory = posStore.allProductCategories.find(
      (category: PosCategory) => category.name.toLowerCase() === target,
    );
    if (shouldShowAllCategory.value) return 'all';
    return nonAlcoholicCategory ? nonAlcoholicCategory.id : undefined;
  }

  const selectedCategoryId = ref<string | undefined>(getDefaultCategoryId());

  const computedCategories = computed<PosCategory[]>(() => {
    if (shouldOnlyShowAllCategory.value) return [AllCategory];
    if (shouldShowAllCategory.value) return [AllCategory].concat(posStore.allProductCategories);
    return posStore.allProductCategories;
  });

  const isCategoryAlcoholic = computed(() => {
    const category = computedCategories.value.find((c) => c.id == selectedCategoryId.value);
    return category?.name === 'Alcoholic';
  });

  const shouldShowAlcoholWarning = computed(() => {
    return (
      settingStore.loaded &&
      isCategoryAlcoholic.value &&
      !settingStore.isAlcoholTime &&
      toValue(pointOfSale)?.useAuthentication
    );
  });

  const alcoholTimeToday = computed(() =>
    new Date(settingStore.alcoholTimeToday).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  );

  const selectCategory = (categoryId: string) => {
    selectedCategoryId.value = categoryId;
  };

  watch(
    () => toValue(pointOfSale),
    (newPos) => {
      if (newPos) selectedCategoryId.value = getDefaultCategoryId();
    },
  );

  return {
    computedCategories,
    selectedCategoryId,
    selectCategory,
    shouldShowAlcoholWarning,
    alcoholTimeToday,
  };
}

export type PosCategories = ReturnType<typeof usePosCategories>;
