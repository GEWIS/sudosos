<template>
  <DataTable
    lazy
    :paginator="paginator"
    :rows="rows"
    :rows-per-page-options="[5, 10, 25, 50, 100]"
    :total-records="totalRecords"
    :value="mutations"
    @page="onPage($event)"
  >
    <Column field="moment" :header="t('components.mutations.when')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-6" />
      </template>
      <template v-else #body="mutation">
        <span class="hidden sm:block">
          {{ mutation.data.moment.toLocaleDateString(locale, { dateStyle: 'full' }) }}
        </span>
        <span class="sm:hidden whitespace-nowrap">
          {{ mutation.data.moment.toLocaleDateString('nl-NL', { dateStyle: 'short' }) }}
        </span>
      </template>
    </Column>

    <Column field="type" :header="t('components.mutations.type')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-6" />
      </template>
      <template v-else #body="mutation">
        {{ getDescription(mutation.data) }}
      </template>
    </Column>

    <Column field="amount" :header="t('components.mutations.amount')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="mutation">
        <div v-if="isIncreasingTransfer(mutation.data.type)" class="font-bold" style="color: #198754">
          {{ formatPrice((mutation.data as FinancialMutation).amount) }}
        </div>
        <div
          v-else-if="
            isFine(mutation.data.type) || mutation.data.type === FinancialMutationType.INACTIVE_ADMINISTRATIVE_COST
          "
          class="font-bold"
          style="color: #d40000"
        >
          {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
        </div>
        <div v-else>
          {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
        </div>
      </template>
    </Column>

    <Column field="" style="width: 10%">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="mutation">
        <i
          class="cursor-pointer pi pi-info-circle"
          @click="() => openModal(mutation.data.id, mutation.data.type, mutation.data.inactiveCostId)"
        />
      </template>
    </Column>
  </DataTable>

  <ModalMutation
    v-if="
      openedMutationId &&
      openedMutationType !== undefined &&
      openedMutationType !== FinancialMutationType.INACTIVE_ADMINISTRATIVE_COST
    "
    :id="openedMutationId"
    v-model:visible="isModalVisible"
    :type="openedMutationType"
    @deleted="refresh"
  />
  <ModalInactive
    v-if="openedInactiveCostId"
    :id="openedInactiveCostId"
    @close="openedInactiveCostId = undefined"
    @delete="
      () => {
        openedInactiveCostId = undefined;
        void refresh();
      }
    "
  />
</template>

<script lang="ts" setup>
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, type Ref, ref } from 'vue';
import type { PaginatedTransferResponse, TransferResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';
import {
  type FinancialMutation,
  FinancialMutationType,
  parseTransfer,
  getDescription,
  isIncreasingTransfer,
  isFine,
} from '@/utils/mutationUtils';
import ModalMutation from '@/components/mutations/mutationmodal/ModalMutation.vue';
import ModalInactive from '@/components/mutations/mutationmodal/ModalInactive.vue';

const { t, locale } = useI18n();

const props = defineProps<{
  getTransfers: (take: number, skip: number) => Promise<PaginatedTransferResponse | undefined>;
  paginator?: boolean;
  rowsAmount?: number;
}>();

const rows: Ref<number> = ref(props.rowsAmount || 10);
const mutations = ref<FinancialMutation[]>(new Array(rows.value));
const totalRecords = ref<number>(0);
const isLoading: Ref<boolean> = ref(true);

async function refresh() {
  isLoading.value = true;
  const result = await props.getTransfers(rows.value, 0);
  if (!result) {
    isLoading.value = false;
    return;
  }
  mutations.value = result.records.map((t: TransferResponse) => parseTransfer(t));
  totalRecords.value = result._pagination.count || 0;
  isLoading.value = false;
}

onMounted(async () => {
  await refresh();
});

async function onPage(event: DataTablePageEvent) {
  const result = await props.getTransfers(event.rows, event.first);
  if (!result) return;
  mutations.value = result.records.map((t: TransferResponse) => parseTransfer(t));
}

const openedMutationId = ref<number>();
const openedMutationType = ref<FinancialMutationType>();
const openedInactiveCostId = ref<number>();
const isModalVisible = ref<boolean>(false);

function openModal(id: number, type: FinancialMutationType, inactiveCostId?: number) {
  if (type === FinancialMutationType.INACTIVE_ADMINISTRATIVE_COST) {
    if (inactiveCostId !== undefined && inactiveCostId !== null) {
      openedInactiveCostId.value = inactiveCostId;
    }
  } else {
    openedMutationId.value = id;
    openedMutationType.value = type;
    isModalVisible.value = true;
  }
}

defineExpose({ refresh });
</script>
<style lang="scss" scoped></style>
