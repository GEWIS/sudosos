<template>
  <Dialog
    @show="addListenerOnDialogueOverlay(dialog)"
    :visible="visible"
    modal
    :header="t('c_transactionDetailsModal.transactionDetails')"
    class="w-auto flex w-11 md:w-4"
    ref="dialog"
  >
    <div v-if="isLoading">
      <Skeleton class="surface-300 my-1 w-5 h-2rem"/>
      <Skeleton class="surface-300 my-1 w-10 h-2rem"/>
      <br>
      <Skeleton class="surface-300 my-1 w-11 h-2rem"/>
      <Skeleton class="surface-300 my-1 w-11 h-2rem"/>
    </div>

    <TransactionDetailModal
      v-else-if="shouldShowTransaction"
      :transactionInfo="transactionsDetails[props.id]"
      :productsInfo="transactionProducts[props.id]"
    />
    <InvoiceDetailModal v-else-if="shouldShowInvoice" :invoiceInfo="transferDetails[props.id]" />
    <DepositDetailModal v-else-if="shouldShowDeposit" :depositInfo="transferDetails[props.id]" />
    <FineDetailModal v-else-if="shouldShowFine" :fine="transferDetails[props.id]" />
    <WaivedFineDetailModal v-else-if="shouldShowWaivedFine" :waivedFines="transferDetails[props.id]" />
    <template #footer v-if="
      !shouldShowDeposit &&
      !shouldShowInvoice &&
      shouldShowDeleteButton">
      <div class="flex flex-column align-items-end">
        <Button @click="deleteMutation" severity="danger">
          {{ t('c_transactionDetailsModal.delete').toUpperCase() }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, type Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import { useTransactionStore } from '@/stores/transaction.store';
import type { TransactionResponse, TransferResponse } from '@sudosos/sudosos-client';
import type {
  SubTransactionResponse,
  SubTransactionRowResponse
} from '@sudosos/sudosos-client/src/api';
import { useTransferStore } from '@/stores/transfer.store';
import apiService from '@/services/ApiService';
import TransactionDetailModal from '@/components/mutations/mutationmodal/ModalDetailTransaction.vue';
import DepositDetailModal from '@/components/mutations/mutationmodal/ModalDetailDeposit.vue';
import InvoiceDetailModal from '@/components/mutations/mutationmodal/ModalDetailInvoice.vue';
import FineDetailModal from '@/components/mutations/mutationmodal/ModalDetailFine.vue';
import WaivedFineDetailModal from "@/components/mutations/mutationmodal/ModalDetailWaivedFine.vue";
import router from '@/router';
import { addListenerOnDialogueOverlay } from '@/utils/dialogUtil';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import { handleError } from '@/utils/errorUtils';
import { FinancialMutationType } from '@/utils/mutationUtils';
import { UserRole } from '@/utils/rbacUtils';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import Skeleton from "primevue/skeleton";

const props = defineProps<{
    type: FinancialMutationType,
    id: number
}>();

const { t } = useI18n();

const visible = ref<boolean>(false);
const transactionStore = useTransactionStore();
const transactionsDetails: Ref<{ [id: number]: TransactionResponse }> = ref({});
const transactionProducts: Ref<{ [id: number]: Array<SubTransactionRowResponse> }> = ref({});
const transferStore = useTransferStore();
const transferDetails: Ref<{ [id: number]: TransferResponse }> = ref({});
const dialog: Ref<null | any> = ref(null);
const toast = useToast();
const authStore = useAuthStore();
const isLoading: Ref<boolean> = ref(false);

const shouldShowDeleteButton = computed(() => {
  // If the transfer is not loaded yet, do not show the delete button.
  if (!transferDetails.value[props.id]) return false;
  return authStore.roles.includes(UserRole.BAC) || authStore.roles.includes(UserRole.BOARD);
});

const shouldShowInvoice = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.INVOICE;
});

const shouldShowTransaction = computed(() => {
  if (!transactionsDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.TRANSACTION;
});

const shouldShowDeposit = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.DEPOSIT;
});

const shouldShowFine = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return (
    props.type === FinancialMutationType.FINE);
});

const shouldShowWaivedFine = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return (
    props.type === FinancialMutationType.WAIVED_FINE);
});

async function fetchTransferInfo() {
  if (transferDetails.value[props.id]) return; // We already have content!
  await transferStore.fetchIndividualTransfer(props.id, apiService).then(() => {
    transferDetails.value[props.id] = transferStore.transfer as TransferResponse;
  });
}

async function fetchTransactionInfo() {
  if (transactionsDetails.value[props.id]) return; // We already have content!
  transactionStore.fetchIndividualTransaction(props.id, apiService).then(() => {
    if (!transactionStore.transaction) {
      router.replace({ path: '/error' });
      return;
    }
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
  if (props.type == FinancialMutationType.TRANSACTION) await fetchTransactionInfo();
  else await fetchTransferInfo();
}

// Load on first mount
onMounted(
  async () => {
    isLoading.value = true;
    await fetchMutation();
    isLoading.value = false;
  }
);

// Reload when closing and opening another
watch(
    () => props.id || props.type,
    async () => {
        isLoading.value = true;
        await fetchMutation();
        isLoading.value = false;
    }
);


const deleteMutation = async () => {
  if (shouldShowFine.value) {
    const transferDetail = transferDetails.value[props.id];

    if (!transferDetail || !transferDetail.fine) {
      await router.replace({ path: '/error' });
      return;
    }

    await apiService.debtor
      .deleteFine(transferDetail.fine.id)
      .then(() => {
        toast.add({
          summary: t('successMessages.success'),
          detail: t('successMessages.fineDeleted'),
          severity: 'success',
          life: 3000
        });
        router.go(0);
      })
      .catch((err: AxiosError) => {
        handleError(err, toast);
      });
  } else {
    const transactionsDetail = transactionsDetails.value[props.id];

    if (!transactionsDetail) {
      await router.replace({ path: '/error' });
      return;
    }

    await apiService.transaction
      .deleteTransaction(transactionsDetail.id)
      .then(() => {
        toast.add({
          summary: t('successMessages.success'),
          detail: t('successMessages.transactionDeleted'),
          severity: 'success',
          life: 3000
        });
        router.go(0);
      })
      .catch((err: AxiosError) => {
        handleError(err, toast);
      });
  }
};
</script>

<style scoped lang="scss"></style>
