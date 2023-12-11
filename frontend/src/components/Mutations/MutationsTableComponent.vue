<template>
  <CardComponent :action="action" :header="header" :router-link="routerLink">
    <DataTable
        :rows=15
        :value="mutations"
        :paginator="paginator"
        tableStyle="min-width: 60rem">
      <Column field="mutationMoment" header="When"/>
      <Column field="mutationDescription" header="What"/>
      <Column>
        <template #body="m">
            <i @click="openModal(m.data.mutationID, m.data.mutationType)" class="pi pi-info-circle"/>
        </template>
      </Column>
    </DataTable>
  </CardComponent>
  <MutationModal
    :type="selectedMutationType"
    :id="selectedMutationId"
    v-model:visible="mutationShow"
  />
</template>


<script lang="ts" setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import CardComponent from "@/components/CardComponent.vue";
import type {
  BaseTransactionResponse,
  FinancialMutationResponse, PaginatedBaseTransactionResponse,
  PaginatedFinancialMutationResponse,
  TransferResponse
} from "@sudosos/sudosos-client";
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { formatDateTime } from "@/utils/formatterUtils";
import MutationModal from "@/components/Mutations/MutationModal.vue";
import {
  parseFinancialTransactions,
  parseTransaction,
  parseTransfer,
  transactionDescription,
  transferDescription
} from "@/utils/mutationUtils";

interface MutationTableRow {
  mutationDescription: string,
  mutationMoment: string,
  mutationType: string,
  mutationID: number,
}

const props = defineProps({
  action: {
    type: String,
    required: false,
  },
  header: {
    type: String,
    required: true,
  },
  routerLink: {
    type: String,
    required: false,
  },
  paginatedMutationResponse: {
    type: Object as () => PaginatedFinancialMutationResponse | PaginatedBaseTransactionResponse,
    required: true,
  },
  paginator: {
    type: Boolean,
    required: true,
  },
  modal: {
    type: Boolean,
    required: true,
  },
});

const mutations = ref<MutationTableRow[]>();
const selectedMutationId = ref<number>(-1); // TODO: Handle the case when this is not changed
const selectedMutationType = ref<string>(""); // TODO: Handle the case when this is not changed
const mutationShow = ref<boolean>(false);

function isPaginatedBaseTransactionResponse(obj: any): obj is PaginatedBaseTransactionResponse {
  return obj.records && obj.records.length > 0 && 'id' in obj.records[0];
}

onBeforeMount(() => {
  if (isPaginatedBaseTransactionResponse(props.paginatedMutationResponse)){
    mutations.value = parseFinancialTransactions(props.paginatedMutationResponse);
  } else {
    mutations.value = parseFinancialMutations(props.paginatedMutationResponse);
  }
});

function parseFinancialMutations(mutations: PaginatedFinancialMutationResponse): MutationTableRow[] {
  let result: MutationTableRow[] = [];
  mutations.records.forEach((mutation: FinancialMutationResponse) => {
    if (mutation.type === "transaction") {
      const transaction = mutation.mutation as BaseTransactionResponse;
      result.push(parseTransaction(transaction));
    } else if (mutation.type === "transfer") {
      const transfer = mutation.mutation as TransferResponse;
      result.push(parseTransfer(transfer));
    }
  });
  return result;
}

function openModal(id: number, type: string) {
  selectedMutationId.value = id;
  selectedMutationType.value = type;
  mutationShow.value = true;
}

</script>

<style lang="scss" scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f8f8;
  border-top: none;
  text-transform: uppercase;
  font-family: Lato, Arial, sans-serif !important;
  font-size: 1rem;
  padding: 0.375rem 0;
  line-height: 1.5;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: #f8f8f8;
}

:deep(.p-datatable .p-paginator) {
  background-color: #f8f8f8;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  font-family: Lato, Arial, sans-serif !important;
}


</style>
