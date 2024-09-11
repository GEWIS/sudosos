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
import { computed } from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { UserRole } from "@/utils/rbacUtils";
import { usePointOfSaleStore } from "@/stores/pos.store";
import type { PaginatedPointOfSaleResponse } from "@sudosos/sudosos-client";
import router from "@/router";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const pointOfSaleStore = usePointOfSaleStore();
const userStore = useUserStore();

const toast = useToast();

const isBacPM = computed(() => {
  return userStore.current.rolesWithPermissions.findIndex(r => r.name == UserRole.BAC_PM) != -1;
});

const getPointsOfSale = async (take: number, skip: number):
    Promise<PaginatedPointOfSaleResponse | undefined> => {
  if (!userStore.getCurrentUser) {
    await router.replace({ path: '/error' });
    return;
  }
  let pointsOfSale;
  if (isBacPM.value) {
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
