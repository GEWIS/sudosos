<template>
  <PageContainer>
    <BannersList
      :active-filter="activeFilter"
      :banners="banners"
      :expired-filter="expiredFilter"
      :is-loading="isLoading"
      :order="order"
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      :skip="skip"
      :total-records="totalRecords"
      @page="onPage"
      @sort="onSort"
      @update:active-filter="(v) => (activeFilter = v)"
      @update:expired-filter="(v) => (expiredFilter = v)"
    />
  </PageContainer>
</template>
<script setup lang="ts">
import BannersList from '@/modules/admin/components/banners/BannersList.vue';
import PageContainer from '@/layout/PageContainer.vue';
import { usePaginatedBanners } from '@/composables/paginatedBanners';

const {
  activeFilter,
  expiredFilter,
  order,
  isLoading,
  totalRecords,
  banners,
  rows,
  rowsPerPageOptions,
  onPage,
  onSort,
  skip,
} = usePaginatedBanners();
</script>
