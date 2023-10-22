<template>
  <CardComponent :action="action" :header="header" :router-link="routerLink">
    <DataTable
        v-if="extended"
        :rows=15
        :value="mutations" paginator
        tableStyle="min-width: 60rem">
      <Column field="mutationMoment" header="When"/>
      <Column field="mutationDescription" header="What"/>
      <Column>
        <template #body="m">
          <MutationModal :id=m.data.mutationID :type=m.data.mutationType />
          {{m.data.mutationID}}
        </template>
      </Column>
    </DataTable>
    <DataTable
        v-else
        :value="mutations"
        tableStyle="min-width: 60rem">
      <Column field="mutationMoment" header="When"/>
      <Column field="mutationDescription" header="What"/>
    </DataTable>
  </CardComponent>
</template>


<script lang="ts" setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import CardComponent from "@/components/CardComponent.vue";
import type {
  BaseTransactionResponse,
  Dinero,
  FinancialMutationResponse,
  PaginatedFinancialMutationResponse,
  TransferResponse
} from "@sudosos/sudosos-client";
import { onMounted, ref } from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { formatDateTime, formatPrice } from "@/utils/formatterUtils";
import MutationModal from "@/components/Mutations/MutationModal.vue";

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
  Mutations: {
    type: Object as () => PaginatedFinancialMutationResponse,
    required: true,
  },
  extended: {
    type: Boolean,
    required: false,
  }
});

const mutations = ref<MutationTableRow[]>();

onMounted(() => {
  mutations.value = parseFinancialMutations(props.Mutations);
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

function parseTransaction(transaction: BaseTransactionResponse): MutationTableRow {
  return {
    'mutationDescription': transactionDescription(transaction),
    'mutationMoment': formatDateTime(new Date(transaction.createdAt)),
    'mutationType': 'transaction',
    'mutationID': transaction.id,
  };
}

function parseTransfer(transfer: TransferResponse): MutationTableRow {
  return {
    mutationDescription: transferDescription(transfer),
    mutationID: transfer.id,
    mutationMoment: formatDateTime(new Date(transfer.createdAt)),
    mutationType: "transfer"
  };
}

function formatValueEuro(value: Dinero): string {
  return formatPrice(value.amount);
}

function transactionDescription(transaction: BaseTransactionResponse): string {
  const currentUserId: number = useUserStore().getCurrentUser.user.id;
  const valueOfTransaction: string = formatValueEuro(transaction.value);
  if (transaction.from.id === currentUserId) {
    if (!transaction.createdBy) {
      return `Magically, a transaction of ${valueOfTransaction} was put in.`;
    } else {
      if (transaction.createdBy.id === currentUserId) {
        return `You spent a total of ${valueOfTransaction}.`;
      } else {
        return `${transaction.createdBy.firstName} charged you ${valueOfTransaction}.`;
      }
    }
  } else {
    return `You charged ${transaction.from.firstName} a total of ${valueOfTransaction}.`;
  }
}

function transferDescription(transfer: TransferResponse): string {
  if (transfer.deposit) {
    return `You increased your balance with ${formatValueEuro(transfer.amount)}.`;
  } else if (transfer.invoice) {
    return `An invoice valued ${formatValueEuro(transfer.amount)} was added.`;
  } else if (transfer.payoutRequest) {
    // Todo: Currently payoutRequests are not fetched. So this will actually not do anything.
    return `You were refunded ${formatValueEuro(transfer.amount)}.`;
  } else {
    return `An unknown transaction was performed on your account.`; // This is probably not even possible.
  }
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
