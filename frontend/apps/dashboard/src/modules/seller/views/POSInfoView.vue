<template>
  <PageContainer>
    <div class="text-4xl mb-4">{{ posName }}</div>
    <div class="flex flex-col gap-3">
      <div class="align-items-stretch flex flex-col gap-5 justify-between md:flex-row">
        <POSSettingsCard class="flex-1" :pos-id="id!" />
        <CardComponent center class="flex-1" :header="t('modules.seller.singlePos.sales')">
          <div class="flex-1 flex flex-col justify-center h-full">
            <div v-if="canLoadTransactions" class="text-7xl text-center">
              {{ formattedTotalSales }}
            </div>
            <div v-else>
              {{ t('common.permissionMessages.transactions') }}
            </div>
          </div>
        </CardComponent>
      </div>
      <ContainerCard
        v-if="posContainers"
        :associated-pos="p"
        class="mt-20"
        :containers="posContainers"
        :pos-edit-allowed="canEditPos"
        show-create
      />
      <CardComponent :header="t('components.mutations.recent')">
        <MutationPOSCard v-if="canLoadTransactions" :get-mutations="getPOSTransactions" paginator />
        <div v-else>{{ t('common.permissionMessages.transactions') }}</div>
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type {
  PaginatedBaseTransactionResponse,
  Dinero as SudoSOSDinero,
  PointOfSaleWithContainersResponse,
} from '@sudosos/sudosos-client';
// eslint-disable-next-line import/no-named-as-default
import Dinero from 'dinero.js';
import { useI18n } from 'vue-i18n';
import { type ContainerWithProductsResponse, type ReportResponse } from '@sudosos/sudosos-client/src/api';
import { getRelation, isAllowed } from '@sudosos/sudosos-frontend-common';
import { usePointOfSaleStore } from '@/stores/pos.store';
import ContainerCard from '@/components/container/ContainersCard.vue';
import router from '@/router';
import apiService from '@/services/ApiService';
import { useContainerStore } from '@/stores/container.store';
import MutationPOSCard from '@/components/mutations/MutationsPOS.vue';
import CardComponent from '@/components/CardComponent.vue';
import POSSettingsCard from '@/modules/seller/components/POSSettingsCard.vue';
import { formatPrice } from 'sudosos-dashboard/src/utils/formatterUtils';
import PageContainer from '@/layout/PageContainer.vue';

const route = useRoute();
const pointOfSaleStore = usePointOfSaleStore();
const containerStore = useContainerStore();
const { t } = useI18n();

const id = ref<number>();

const p = computed<PointOfSaleWithContainersResponse | undefined>(
  () => pointOfSaleStore.pointsOfSaleWithContainers[id.value!],
);

const canEditPos = computed(() => {
  return p.value && isAllowed('update', [getRelation(p.value.owner!.id)], 'PointOfSale', ['any']);
});

const posName = computed(() => {
  return id.value && p.value ? p.value.name : t('common.loading');
});

const canLoadTransactions = computed(() => {
  if (p.value == undefined) return false;
  return isAllowed('get', [getRelation(p.value.owner!.id)], 'Transaction', ['any']);
});

// Fetch containers from the container store, then the ContainerCard will be reactive.
const posContainerIds = computed(() =>
  p.value?.containers.map((container: ContainerWithProductsResponse) => container.id),
);
const posContainers = computed(() =>
  Object.values(containerStore.getAllContainers).filter((container) => posContainerIds.value?.includes(container.id)),
);

onBeforeMount(async () => {
  id.value = Number(route.params.id);
  await containerStore.fetchAllIfEmpty();
  await pointOfSaleStore.fetchPointOfSaleWithContainers(id.value);
  if (!p.value) {
    await router.replace('/error');
    return;
  }
});

const totalSales = ref(Dinero({ amount: 0, currency: 'EUR' }));

const formattedTotalSales = computed(() => {
  return formatPrice(totalSales.value.toObject() as SudoSOSDinero);
});

watch(
  () => canLoadTransactions.value,
  async (canLoad) => {
    if (!canLoad || !p.value?.owner) return;
    await apiService.user
      .getUsersSalesReport(
        p.value.owner.id,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
      )
      .then((res) => {
        const data: ReportResponse = res.data;
        if (!data.data.pos) return;
        const posReport = data.data.pos.find((r) => r.pos.id === p.value?.id);
        if (!posReport) return;
        totalSales.value = Dinero(posReport.totalInclVat as Dinero.Options);
      });
  },
);

const getPOSTransactions = async (
  take: number,
  skip: number,
): Promise<PaginatedBaseTransactionResponse | undefined> => {
  return await apiService.pos.getTransactions(id.value!, take, skip).then((res) => res.data);
};
</script>

<style scoped lang="scss"></style>
