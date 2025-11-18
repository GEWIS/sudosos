<template>
  <CardComponent :header="t('modules.admin.banners.list.header')">
    <DataView
      data-key="id"
      :first="props.skip"
      lazy
      :loading="isLoading"
      paginator
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      :total-records="totalRecords"
      :value="banners"
      @page="onPage"
    >
      <template #header>
        <div class="items-center flex flex-col justify-between md:flex-row">
          <SelectButton
            :model-value="selectedFilters"
            multiple
            option-label="name"
            :options="options"
            @update:model-value="updateFilters"
          />
          <Button
            class="md:mt-0 mt-2"
            icon="pi pi-plus"
            :label="t('common.create')"
            @click="() => selectBanner(undefined)"
          />
        </div>
      </template>
      <template #list="slotProps">
        <div class="grid gap-0">
          <BannerItem
            v-for="(item, index) in slotProps.items"
            :key="index"
            :banner="item"
            :index="index"
            @select:banner="selectBanner"
          />
        </div>
      </template>
    </DataView>
  </CardComponent>
  <BannerDialog v-model:visible="dialogVisible" :banner="banner" />
</template>
<script setup lang="ts">
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import type { BannerResponse } from '@sudosos/sudosos-client';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BannerItem from '@/modules/admin/components/banners/BannerItem.vue';
import CardComponent from '@/components/CardComponent.vue';
import BannerDialog from '@/modules/admin/components/banners/BannerDialog.vue';

const { t } = useI18n();

const props = defineProps<{
  banners: BannerResponse[];
  isLoading: boolean;
  totalRecords: number;
  rows: number;
  rowsPerPageOptions: number[];
  skip: number;
  activeFilter?: boolean;
  expiredFilter?: boolean;
  order: string;
}>();

const emit = defineEmits<{
  (e: 'page', event: unknown): void;
  (e: 'sort', order: string): void;
  (e: 'update:activeFilter', value: boolean | undefined): void;
  (e: 'update:expiredFilter', value: boolean | undefined): void;
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onPage = (event: any) => {
  emit('page', event);
};

const dialogVisible = ref<boolean>(false);
const banner = ref<BannerResponse | undefined>();
const selectBanner = (b?: BannerResponse) => {
  banner.value = b;
  dialogVisible.value = true;
};

interface FilterOption {
  name: string;
  type: Filter;
}

enum Filter {
  ACTIVE,
  EXPIRED,
}

const options = [
  {
    name: t('modules.admin.banners.list.filterActive'),
    type: Filter.ACTIVE,
  },
  {
    name: t('modules.admin.banners.list.filterNotExpired'),
    type: Filter.EXPIRED,
  },
];

const selectedFilters = computed(() => {
  const filters: FilterOption[] = [];
  if (props.activeFilter === true) {
    filters.push(options[0]);
  }
  if (props.expiredFilter === false) {
    filters.push(options[1]);
  }
  return filters;
});

const updateFilters = (filters: FilterOption[]) => {
  const appliedTypes = filters.map((f) => f.type);
  emit('update:activeFilter', appliedTypes.includes(Filter.ACTIVE) ? true : undefined);
  emit('update:expiredFilter', appliedTypes.includes(Filter.EXPIRED) ? false : undefined);
};
</script>
