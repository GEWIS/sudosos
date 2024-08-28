<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ posName }}</div>
    <div class="flex flex-column gap-5">
      <div class="flex flex-column md:flex-row gap-5 justify-content-between align-items-stretch w-12">
        <POSSettingsCard :pos-id="id!" class="flex-1 h-12" />
        <CardComponent :header="$t('c_posInfo.lastWeekSales')" class="flex-1" >
          <div class="h-12 text-center text-5xl pb-3">{{ formattedTotalSales }}</div>
        </CardComponent>
      </div>
      <ContainerCard
        class="container-card"
        v-if="posContainers"
        :containers="posContainers"
        show-create
        :associatedPos="pointsOfSaleWithContainers[id!]"
      />
      <CardComponent :header="$t('transactions.recentTransactions')">
        <MutationPOSCard
          class="pos-transactions"
          :get-mutations="getPOSTransactions"
          paginator
          style="width: 100% !important"
        />
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePointOfSaleStore } from '@/stores/pos.store';
import type {
  PaginatedBaseTransactionResponse,
  Dinero as SudoSOSDinero
} from '@sudosos/sudosos-client';
import ContainerCard from '@/components/container/ContainersCard.vue';
import router from '@/router';
import apiService from '@/services/ApiService';
import { useContainerStore } from "@/stores/container.store";
import MutationPOSCard from "@/components/mutations/MutationsPOS.vue";
import CardComponent from "@/components/CardComponent.vue";
import POSSettingsCard from "@/modules/seller/components/POSSettingsCard.vue";
import { useTransactionStore } from "@/stores/transaction.store";
import { formatPrice } from "sudosos-dashboard/src/utils/formatterUtils";
import Dinero from "dinero.js";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

const route = useRoute(); // Use the useRoute function to access the current route
const id = ref<number>();
const pointOfSaleStore = usePointOfSaleStore();

const { pointsOfSaleWithContainers } = storeToRefs(pointOfSaleStore);

const containerStore = useContainerStore();

const { t } = useI18n();

const posName = computed(() => {
  return id.value && pointsOfSaleWithContainers.value[id.value]
  ? pointsOfSaleWithContainers.value[id.value].name
  : t('common.loading');
});

// Fetch containers from the container store, then the ContainerCard will be reactive.
const posContainerIds = computed(() =>
    pointsOfSaleWithContainers.value[id.value!]?.containers.map((container) => container.id)
);
const posContainers = computed(() => Object.values(containerStore.getAllContainers)
    .filter((container) => posContainerIds.value?.includes(container.id)));

onBeforeMount(async () => {
  id.value = Number(route.params.id);
  await containerStore.fetchAllIfEmpty();
  await pointOfSaleStore.fetchPointOfSaleWithContainers(id.value);
  if (!pointsOfSaleWithContainers.value[id.value]) {
    await router.replace('/error');
    return;
  }
});

const totalSales = ref(Dinero({ amount: 0, currency: "EUR" }));

const formattedTotalSales = computed(() => {
  return formatPrice(totalSales.value.toObject() as SudoSOSDinero);
});

onMounted(async () => {
  const transactionStore = useTransactionStore();
  const transactionsInLastWeek = (await transactionStore.fetchTransactionsFromPointOfSale(
      apiService,
      id.value!,
      new Date(Date.now()-(7*24*60*60*1000)).toISOString(),
      new Date().toISOString(), Number.MAX_SAFE_INTEGER, 0)).data.records;

  for (let transaction of transactionsInLastWeek) {
    totalSales.value = totalSales.value.add(Dinero(transaction.value as Dinero.Options));
  }
});

const getPOSTransactions = async (
  take: number,
  skip: number
): Promise<PaginatedBaseTransactionResponse | undefined> => {
  return await apiService.pos.getTransactions(id.value!, take, skip).then((res) => res.data);
};

</script>

<style scoped lang="scss">
</style>
