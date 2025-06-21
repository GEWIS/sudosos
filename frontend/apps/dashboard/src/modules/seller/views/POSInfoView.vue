<template>
  <PageContainer>
    <div class="text-4xl mb-4">{{ posName }}</div>
    <div class="flex flex-col gap-5">
      <div class="align-items-stretch flex flex-col gap-5 justify-between md:flex-row">
        <POSSettingsCard class="flex-1 h-12" :pos-id="id!" />
        <CardComponent class="flex-1" :header="t('modules.seller.singlePos.sales')">
          <div v-if="canLoadTransactions" class="h-22 pb-3 text-5xl text-center">{{ formattedTotalSales }}</div>
          <div v-else>{{ t('common.permissionMessages.transactions') }}</div>
        </CardComponent>
      </div>
      <ContainerCard
        v-if="posContainers"
        :associated-pos="pointsOfSaleWithContainers[id!]"
        class="mt-20"
        :containers="posContainers"
        :pos-edit-allowed="canEditPos"
        show-create
      />
      <CardComponent :header="t('components.mutations.recent')">
        <MutationPOSCard
          v-if="canLoadTransactions"
          :get-mutations="getPOSTransactions"
          paginator
          style="width: 100% !important"
        />
        <div v-else>{{ t('common.permissionMessages.transactions') }}</div>
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { PaginatedBaseTransactionResponse, Dinero as SudoSOSDinero } from '@sudosos/sudosos-client';
// eslint-disable-next-line import/no-named-as-default
import Dinero from 'dinero.js';
import { type StoreGeneric, storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { type ContainerWithProductsResponse } from '@sudosos/sudosos-client/src/api';
import { usePointOfSaleStore } from '@/stores/pos.store';
import ContainerCard from '@/components/container/ContainersCard.vue';
import router from '@/router';
import apiService, { DEFAULT_PAGINATION_MAX } from '@/services/ApiService';
import { useContainerStore } from '@/stores/container.store';
import MutationPOSCard from '@/components/mutations/MutationsPOS.vue';
import CardComponent from '@/components/CardComponent.vue';
import POSSettingsCard from '@/modules/seller/components/POSSettingsCard.vue';
import { useTransactionStore } from '@/stores/transaction.store';
import { formatPrice } from 'sudosos-dashboard/src/utils/formatterUtils';
import { getRelation, isAllowed } from '@/utils/permissionUtils';
import PageContainer from '@/layout/PageContainer.vue';

const route = useRoute(); // Use the useRoute function to access the current route
const id = ref<number>();
const pointOfSaleStore = usePointOfSaleStore();

const { pointsOfSaleWithContainers } = storeToRefs(pointOfSaleStore as StoreGeneric);

const containerStore = useContainerStore();

const { t } = useI18n();

const canEditPos = computed(() => {
  return (
    pointsOfSaleWithContainers.value[id.value!] &&
    isAllowed('update', [getRelation(pointsOfSaleWithContainers.value[id.value!].owner!.id)], 'PointOfSale', ['any'])
  );
});

const posName = computed(() => {
  return id.value && pointsOfSaleWithContainers.value[id.value]
    ? pointsOfSaleWithContainers.value[id.value].name
    : t('common.loading');
});

const canLoadTransactions = computed(() => {
  if (pointsOfSaleWithContainers.value[id.value!] == undefined) return false;
  return isAllowed('get', [getRelation(pointsOfSaleWithContainers.value[id.value!].owner!.id)], 'Transaction', ['any']);
});

// Fetch containers from the container store, then the ContainerCard will be reactive.
const posContainerIds = computed(() =>
  pointsOfSaleWithContainers.value[id.value!]?.containers.map(
    (container: ContainerWithProductsResponse) => container.id,
  ),
);
const posContainers = computed(() =>
  Object.values(containerStore.getAllContainers).filter((container) => posContainerIds.value?.includes(container.id)),
);

onBeforeMount(async () => {
  id.value = Number(route.params.id);
  await containerStore.fetchAllIfEmpty();
  await pointOfSaleStore.fetchPointOfSaleWithContainers(id.value);
  if (!pointsOfSaleWithContainers.value[id.value]) {
    await router.replace('/error');
    return;
  }
});

const totalSales = ref(Dinero({ amount: 0, currency: 'EUR' }));

const formattedTotalSales = computed(() => {
  return formatPrice(totalSales.value.toObject() as SudoSOSDinero);
});

onMounted(async () => {
  if (!canLoadTransactions.value) return;
  const transactionStore = useTransactionStore();
  const transactionsInLastWeek = (
    await transactionStore.fetchTransactionsFromPointOfSale(
      apiService,
      id.value!,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString(),
      DEFAULT_PAGINATION_MAX,
      0,
    )
  ).data.records;

  for (const transaction of transactionsInLastWeek) {
    totalSales.value = totalSales.value.add(Dinero(transaction.value as Dinero.Options));
  }
});

const getPOSTransactions = async (
  take: number,
  skip: number,
): Promise<PaginatedBaseTransactionResponse | undefined> => {
  return await apiService.pos.getTransactions(id.value!, take, skip).then((res) => res.data);
};
</script>

<style scoped lang="scss"></style>
