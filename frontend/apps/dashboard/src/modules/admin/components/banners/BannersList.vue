<template>
  <CardComponent :header="t('modules.admin.banners.list.header')">
    <DataView
      data-key="id"
      :first="props.skip && props.skip - 1"
      paginator
      :rows="props.take"
      :value="displayedBanners"
    >
      <template #header>
        <div class="align-items-center flex flex-column justify-content-between md:flex-row">
          <SelectButton v-model="filters" multiple option-label="name" :options="options" />
          <Button
            class="md:mt-0 mt-2"
            icon="pi pi-plus"
            :label="t('common.create')"
            @click="isCreateDialogVisible = true"
          />
        </div>
      </template>
      <template #list="slotProps">
        <div class="grid grid-nogutter">
          <BannerItem v-for="(item, index) in slotProps.items" :key="index" :banner="item" :index="index" />
        </div>
      </template>
    </DataView>
  </CardComponent>
  <BannerDialog v-model:visible="isCreateDialogVisible" />
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
  skip?: number | undefined;
  take?: number | undefined;
}>();

const isCreateDialogVisible = ref<boolean>();

// Filtering the banners
const filters = ref<FilterOption[]>();

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

const displayedBanners = computed(() => {
  return props.banners
    .filter((b) => {
      const appliedFilters = filters.value?.map((f) => f.type) || [];

      // Filters active banners
      if (appliedFilters.includes(Filter.ACTIVE) && !b.active) return false;
      // Filters expired banners
      if (appliedFilters.includes(Filter.EXPIRED) && Date.parse(b.endDate) <= Date.now()) return false;

      return true;
    })
    .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate));
});
</script>
