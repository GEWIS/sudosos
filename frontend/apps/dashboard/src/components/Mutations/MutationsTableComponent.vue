<template>
  <CardComponent :action="action" :header="header" :router-link="routerLink" class="w-full">
    <DataTable
      :rows="rows"
      :value="mutations"
      :rowsPerPageOptions="[5, 10, 25, 50, 100]"
      :paginator="paginator"
      lazy
      @page="onPage($event)"
      :totalRecords="totalRecords"
      :rowClass="isSomeoneElsesTransaction"
    >
      <Column field="moment" style="width: 30%" :header="$t('transactions.when')">
        <template #body v-if="isLoading">
          <Skeleton class="w-6 my-1 h-1rem surface-300" />
        </template>
        <template #body="mutation" v-else>
          <span class="hidden sm:block">{{ mutation.data.moment.toLocaleDateString($i18n.locale, {
            dateStyle: 'full'
          }) }}</span>
          <span class="sm:hidden">{{
            mutation.data.moment.toLocaleDateString('nl-NL', {
              dateStyle: 'short'
            })
            }}
          </span>
        </template>
      </Column>

      <Column field="mutationDescription" style="width: 30%" :header="$t('transactions.what')">
        <template #body v-if="isLoading">
          <Skeleton class="w-6 my-1 h-1rem surface-300" />
        </template>
        <template #body="mutation" v-else>
          {{ getDescription(mutation.data) }}
        </template>
      </Column>

      <Column field="change" style="width: 30%" :header="$t('transactions.amount')">
        <template #body v-if="isLoading">
          <Skeleton class="w-3 my-1 h-1rem surface-300" />
        </template>
        <template #body="mutation" v-else>
          <div
            v-if="
              mutation.data.type == FinancialMutationType.DEPOSIT ||
              mutation.data.type == FinancialMutationType.INVOICE ||
              mutation.data.type == FinancialMutationType.WAIVED_FINE
            "
            style="color: #198754"
            class="font-bold"
          >
            {{ formatPrice((mutation.data as FinancialMutation).amount) }}
          </div>

          <div
            v-else-if="mutation.data.type == FinancialMutationType.FINE"
            style="color: #d40000"
            class="font-bold"
          >
            {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
          </div>

          <div v-else severity="info">
            {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
          </div>
        </template>
      </Column>

      <Column field="" style="width: 10%">
        <template #body v-if="isLoading">
          <Skeleton class="w-3 my-1 h-1rem surface-300" />
        </template>
        <template #body="mutation" v-else>
          <i
            class="pi pi-info-circle cursor-pointer"
            @click="() => openModal(mutation.data.id, mutation.data.type)"
          />
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
import type { DataTablePageEvent } from 'primevue/datatable';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import CardComponent from '@/components/CardComponent.vue';
import Skeleton from 'primevue/skeleton';
import { formatPrice } from '@/utils/formatterUtils';
import type {
  BaseTransactionResponse,
  FinancialMutationResponse,
  PaginatedBaseTransactionResponse,
  PaginatedFinancialMutationResponse,
  TransferResponse
} from '@sudosos/sudosos-client';
import { onMounted, type Ref, ref } from 'vue';
import MutationModal from '@/components/Mutations/MutationModal.vue';
import {
  type FinancialMutation,
  FinancialMutationType,
  parseFinancialTransactions,
  parseTransaction,
  parseTransfer
} from '@/utils/mutationUtils';
import 'primeicons/primeicons.css';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@sudosos/sudosos-frontend-common';

const props = defineProps({
  action: {
    type: String,
    required: false
  },
  header: {
    type: String,
    required: true
  },
  routerLink: {
    type: String,
    required: false
  },
  paginator: {
    type: Boolean,
    required: true
  },
  modal: {
    type: Boolean,
    required: true
  },
  callbackFunction: {
    type: Function,
    required: true
  },
  rowsAmount: {
    type: Number,
    required: false
  }
});

const mutations = ref<FinancialMutation[]>(new Array(10));
const selectedMutationId = ref<number>(-1);
const selectedMutationType = ref<FinancialMutationType>(FinancialMutationType.TRANSACTION);
const mutationShow = ref<boolean>(false);
const totalRecords = ref<number>(0);
const isLoading: Ref<boolean> = ref(true);
const { t } = useI18n();
const userStore = useUserStore();

const rows: Ref<number> = ref(props.rowsAmount || 10);
onMounted(async () => {
  const initialMutations = await getMutations(rows.value, 0);
  mutations.value = parseFinancialMutations(initialMutations);
  totalRecords.value = initialMutations._pagination.count || 0;
  isLoading.value = false;
});

function isPaginatedBaseTransactionResponse(obj: any): obj is PaginatedBaseTransactionResponse {
  return obj.records && obj.records.length > 0 && 'id' in obj.records[0];
}

function parseFinancialMutations(
  mutations: PaginatedFinancialMutationResponse | PaginatedBaseTransactionResponse
): FinancialMutation[] {
  let result: FinancialMutation[] = [];
  if (isPaginatedBaseTransactionResponse(mutations)) {
    mutations.records.forEach((mutation: BaseTransactionResponse) => {
      result.push(parseTransaction(mutation));
    });
  } else {
    mutations.records.forEach((mutation: FinancialMutationResponse) => {
      if (mutation.type === 'transaction') {
        const transaction = mutation.mutation as BaseTransactionResponse;
        result.push(parseTransaction(transaction));
      } else if (mutation.type === 'transfer') {
        const transfer = mutation.mutation as TransferResponse;
        result.push(parseTransfer(transfer));
      }
    });
  }
  return result;
}

function openModal(id: number, type: FinancialMutationType) {
  selectedMutationId.value = id;
  selectedMutationType.value = type;
  mutationShow.value = true;
}

async function onPage(event: DataTablePageEvent) {
  const newTransactions = await getMutations(event.rows, event.first);
  mutations.value = isPaginatedBaseTransactionResponse(newTransactions)
    ? parseFinancialTransactions(newTransactions)
    : parseFinancialMutations(newTransactions);
}

async function getMutations(
  take: number,
  skip: number
): Promise<PaginatedBaseTransactionResponse | PaginatedFinancialMutationResponse> {
  return await props.callbackFunction(take, skip);
}

function getDescription(mutation: FinancialMutation) {
  switch (mutation.type) {
    case FinancialMutationType.TRANSACTION: {
      return t('c_recentTransactionsTable.payment');
    }
    case FinancialMutationType.DEPOSIT: {
      return t('c_recentTransactionsTable.topUp');
    }
    case FinancialMutationType.FINE: {
      return t('c_recentTransactionsTable.fine');
    }
    case FinancialMutationType.WAIVED_FINE: {
      return t('c_recentTransactionsTable.waivedFine');
    }
    case FinancialMutationType.INVOICE: {
      return t('c_recentTransactionsTable.invoice');
    }
    default: {
      return t('c_recentTransactionsTable.unknown');
    }
  }
}

const isSomeoneElsesTransaction = (data: FinancialMutation) => {
  if (isLoading.value) return;
  const isOtherTransaction = data.type === FinancialMutationType.TRANSACTION &&
      data.from?.id != userStore.current.user!!.id;
  return [{ 'font-italic': isOtherTransaction, 'text-500': isOtherTransaction }];
};
</script>

<style lang="scss" scoped></style>
