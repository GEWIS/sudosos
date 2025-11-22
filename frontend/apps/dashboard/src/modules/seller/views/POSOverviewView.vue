<template>
  <PageContainer>
    <div class="flex flex-col">
      <POSOverviewTable class="pos-overview-table" :get-points-of-sale="getPointsOfSale" />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useUserStore, isAllowed } from '@sudosos/sudosos-frontend-common';
import type { PaginatedPointOfSaleResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import POSOverviewTable from '@/modules/seller/components/POSOverviewTable.vue';
import { usePointOfSaleStore } from '@/stores/pos.store';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import PageContainer from '@/layout/PageContainer.vue';

const pointOfSaleStore = usePointOfSaleStore();
const userStore = useUserStore();

const toast = useToast();

const getPointsOfSale = async (take: number, skip: number): Promise<PaginatedPointOfSaleResponse | undefined> => {
  if (!userStore.getCurrentUser) {
    await router.replace({ path: '/error' });
    return;
  }
  let pointsOfSale;
  // If you can get all point of sales, render them. Otherwise only the user ones.
  // TODO: Change to `action: get` after https://github.com/GEWIS/sudosos-backend/issues/62 is fully finished
  if (isAllowed('update', ['all'], 'PointOfSale', ['any'])) {
    pointsOfSale = await pointOfSaleStore.getPointsOfSale(take, skip).catch((err) => handleError(err, toast));
  } else {
    pointsOfSale = await pointOfSaleStore
      .getUserPointsOfSale(userStore.getCurrentUser.user!.id, take, skip)
      .catch((err) => handleError(err, toast));
  }

  if (!pointsOfSale) return;
  return pointsOfSale;
};
</script>

<style scoped lang="scss">
.pos-overview-table {
  width: 80%;
}
</style>
