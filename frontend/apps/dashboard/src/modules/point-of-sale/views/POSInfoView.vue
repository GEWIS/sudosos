<template>
  <div class="page-container flex flex-column gap-5">
    <div class="page-title flex flex-row justify-content-between align-items-center">
      <div class="flex flex-column">
        <span>{{ `${$t("posInfo.POS")}: ${pos ? pos.name : ""}` }}</span>
        <small class="font-italic text-base">
          {{`${ $t('posInfo.ownedBy') } ${pos ? (pos.owner ? pos.owner.firstName + pos.owner.lastName : '') : ''}`}}
        </small>
      </div>
        <Button
          severity="secondary"
          :label="$t('posInfo.Edit')"
          icon="pi pi-pencil"
          @click="handleEditClicked"
          class="h-fit"
        />
    </div>
    <hr />
    <ContainerCard
      class="container-card"
      v-if="pos && pos.containers"
      :containers="posContainers"
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
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePointOfSaleStore } from '@/stores/pos.store';
import type {
  PaginatedBaseTransactionResponse,
  PointOfSaleWithContainersResponse
} from '@sudosos/sudosos-client';
import ContainerCard from '@/components/container/ContainerCard.vue';
import router from '@/router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { handleError } from '@/utils/errorUtils';
import apiService from '@/services/ApiService';
import { useContainerStore } from "@/stores/container.store";
import MutationPOSCard from "@/components/mutations/MutationsPOS.vue";
import CardComponent from "@/components/CardComponent.vue";

const route = useRoute(); // Use the useRoute function to access the current route
const toast = useToast();
const { t } = useI18n();
const id = ref();
const pointOfSaleStore = usePointOfSaleStore();
const pos: Ref<PointOfSaleWithContainersResponse | null | undefined> = ref();

const containerStore = useContainerStore();
const posContainerIds = computed(() => pos.value?.containers.map((container) => container.id));
const posContainers = computed(() => Object.values(containerStore.getAllContainers)
    .filter((container) => posContainerIds.value?.includes(container.id)));

onBeforeMount(async () => {
  id.value = route.params.id;
  await containerStore.fetchAllIfEmpty();
  await pointOfSaleStore.fetchPointOfSale(id.value).catch((error) => {
    handleError(error, toast);
  });
  pos.value = pointOfSaleStore.getPos;
  if (!pos.value) {
    await router.replace('/error');
    return;
  }
});

const getPOSTransactions = async (
  take: number,
  skip: number
): Promise<PaginatedBaseTransactionResponse | undefined> => {
  return await apiService.pos.getTransactions(id.value, take, skip).then((res) => res.data);
};

const handleEditClicked = () => {
  if (pos.value) {
    router.push(`/point-of-sale/edit/${pos.value.id}`);
  } else {
    router.replace({ path: '/error' });
    toast.add({
      severity: 'error',
      summary: t('apiError.error'),
      detail: t('errorMessages.posNotFound'),
      life: 3000
    });
  }
};
</script>

<style scoped lang="scss">
</style>
