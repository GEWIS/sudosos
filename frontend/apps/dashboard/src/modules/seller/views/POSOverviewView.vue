<template>
  <div class="page-container">
    <div class="page-title">{{ t('modules.seller.posOverview.title') }}</div>
    <div class="content-wrapper">
      <POSOverviewTable class="pos-overview-table" :get-points-of-sale="getPointsOfSale"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import POSOverviewTable from "@/modules/seller/components/POSOverviewTable.vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { usePointOfSaleStore } from "@/stores/pos.store";
import type { PaginatedPointOfSaleResponse } from "@sudosos/sudosos-client";
import router from "@/router";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { isAllowed } from "@/utils/permissionUtils";

const { t } = useI18n();

const pointOfSaleStore = usePointOfSaleStore();
const userStore = useUserStore();

const toast = useToast();

const getPointsOfSale = async (take: number, skip: number):
    Promise<PaginatedPointOfSaleResponse | undefined> => {
  if (!userStore.getCurrentUser) {
    await router.replace({ path: '/error' });
    return;
  }
  let pointsOfSale;
  // If you can get all point of sales, render them. Otherwise only the user ones.
  console.log(isAllowed('get', ['all'], 'PointOfSale', ['any']));
  // TODO: Change to `action: get` after https://github.com/GEWIS/sudosos-backend/issues/62 is fully finished
  if (isAllowed('update', ['all'], 'PointOfSale', ['any'])) {
    pointsOfSale = await pointOfSaleStore.getPointsOfSale(take, skip)
        .catch((err) => handleError(err, toast));
  } else {
    pointsOfSale = await pointOfSaleStore.getUserPointsOfSale(userStore.getCurrentUser.user!!.id, take, skip)
        .catch((err) => handleError(err, toast));
  }

  if(!pointsOfSale) return;
  return pointsOfSale;
};

</script>

<style scoped lang="scss">
.pos-overview-table {
  width: 80%;
}
</style>
