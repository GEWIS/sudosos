<template>
  <CardComponent :action="action" :header="header" :router-link="routerLink">
    <DataTable
        :rows=rows
        :value="mutations"
        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        :paginator="paginator"
        lazy
        @page="onPage($event)"
        @row-click="(e: any) => openModal(e.data.mutationID, e.data.mutationType)"
        :totalRecords="totalRecords"
        tableStyle="min-width: 60rem">
      <Column field="mutationMoment" style="width: 35%" header="When"/>
      <Column field="mutationDescription" style="width: 60%" header="What"/>
      <Column>
        <template #body>
            <i class="pi pi-info-circle"/>
        </template>
      </Column>
    </DataTable>
  </CardComponent>
  <MutationModal
    :type="selectedMutationType"
    :id="selectedMutationId"
    v-model:visible="mutationShow"
    :draggable="false"
  />
</template>


<script lang="ts" setup>
import DataTable from "primevue/datatable";
import type { DataTablePageEvent } from "primevue/datatable";
import Column from 'primevue/column';
import CardComponent from "@/components/CardComponent.vue";
import type {
  BaseTransactionResponse,
  FinancialMutationResponse, PaginatedBaseTransactionResponse,
  PaginatedFinancialMutationResponse,
  TransferResponse
} from "@sudosos/sudosos-client";
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import MutationModal from "@/components/Mutations/MutationModal.vue";
import {
  parseFinancialTransactions,
  parseTransaction,
  parseTransfer,
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
  paginator: {
    type: Boolean,
    required: true,
  },
  modal: {
    type: Boolean,
    required: true,
  },
  callbackFunction: {
    type: Function,
    required: true,
  }
});

const mutations = ref<MutationTableRow[]>();
const selectedMutationId = ref<number>(-1); // TODO: Handle the case when this is not changed
const selectedMutationType = ref<string>(""); // TODO: Handle the case when this is not changed
const mutationShow = ref<boolean>(false);
const totalRecords = ref<number>(0);

function isPaginatedBaseTransactionResponse(obj: any): obj is PaginatedBaseTransactionResponse {
  return obj.records && obj.records.length > 0 && 'id' in obj.records[0];
}
const rows: Ref<number> = ref(10);
onMounted( async () => {
  const initialMutations = await getMutations(rows.value, 0);
  totalRecords.value = initialMutations._pagination.count || 0;
  if (isPaginatedBaseTransactionResponse(initialMutations)){
    mutations.value = parseFinancialTransactions(initialMutations);
  } else {
    mutations.value = parseFinancialMutations(initialMutations);
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

async function onPage(event: DataTablePageEvent) {
  const newTransactions = await getMutations(event.rows, event.first);
  mutations.value = isPaginatedBaseTransactionResponse(newTransactions) ?
    parseFinancialTransactions(newTransactions) : parseFinancialMutations(newTransactions);
}

async function getMutations(take: number, skip: number):
  Promise<PaginatedBaseTransactionResponse | PaginatedFinancialMutationResponse> {
  return await props.callbackFunction(take, skip);
}
</script>

<style lang="scss" scoped>
</style>
