<template>
  <Dialog :visible="visible" modal header="Details" :style="{ width: '50vw' }">
    <TransactionDetailModal
      v-if="shouldShowTransaction"
      :transactionInfo="transactionsDetails[props.id]"
      :productsInfo="transactionProducts[props.id]"
    />
    <InvoiceDetailModal v-else-if="shouldShowInvoice" :invoiceInfo="transferDetails[props.id]" />
    <DepositDetailModal v-else-if="shouldShowDeposit" :depositInfo="transferDetails[props.id]" />
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useTransactionStore } from '@/stores/transaction.store';
import type { TransactionResponse, TransferResponse } from '@sudosos/sudosos-client';
import type { SubTransactionResponse, SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';
import { useTransferStore } from '@/stores/transfer.store';
import apiService from '@/services/ApiService';
import TransactionDetailModal from '@/components/Mutations/TransactionDetailModal.vue';
import DepositDetailModal from '@/components/Mutations/DepositDetailModal.vue';
import InvoiceDetailModal from '@/components/Mutations/InvoiceDetailModal.vue';

const props = defineProps({
  type: {
    type: String as () => 'transfer' | 'transaction',
    required: true
  },
  id: {
    type: Number,
    required: true
  }
});

const visible = ref<boolean>(false);
const transactionStore = useTransactionStore();
const transactionsDetails: Ref<{ [id: number]: TransactionResponse }> = ref({});
const transactionProducts: Ref<{ [id: number]: Array<SubTransactionRowResponse> }> = ref({});
const transferStore = useTransferStore();
const transferDetails: Ref<{ [id: number]: TransferResponse }> = ref({});

const shouldShowInvoice = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === 'transfer' && transferDetails.value[props.id].invoice;
});

const shouldShowTransaction = computed(() => {
  if (!transactionsDetails.value[props.id]) return false;
  return props.type === 'transaction';
});

const shouldShowDeposit = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === 'transfer' && transferDetails.value[props.id].deposit;
});

async function fetchTransferInfo() {
  if (transferDetails.value[props.id]) return; // We already have content!
  await transferStore.fetchIndividualTransfer(props.id, apiService).then(() => {
    transferDetails.value[props.id] = transferStore.transfer as TransferResponse;
    console.error(transferDetails.value[props.id]);
  });
}

async function fetchTransactionInfo() {
  if (transactionsDetails.value[props.id]) return; // We already have content!
  transactionStore.fetchIndividualTransaction(props.id, apiService).then(() => {
    transactionsDetails.value[props.id] = transactionStore.transaction;
    getProductsOfTransaction(transactionStore.transaction); // Process subtransactions
  });
}

function getProductsOfTransaction(transactionResponse: TransactionResponse): void {
  if (transactionProducts.value[transactionResponse.id]) return; // We already have content!
  let result: Array<SubTransactionRowResponse> = [];
  transactionResponse.subTransactions.forEach((subTransaction: SubTransactionResponse) => {
    subTransaction.subTransactionRows.forEach((subTransactionRow: SubTransactionRowResponse) => {
      result.push(subTransactionRow);
    });
  });
  transactionProducts.value[transactionResponse.id] = result;
}

async function fetchMutation(): Promise<void> {
  if (props.type == 'transfer') {
    await fetchTransferInfo();
  } else if (props.type == 'transaction') await fetchTransactionInfo();
}

watch(
  () => props.id || props.type,
  async () => {
    await fetchMutation();
  }
);
</script>

<style scoped lang="scss"></style>
