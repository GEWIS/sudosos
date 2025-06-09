<template>
  <Dialog
    ref="dialog"
    :header="t('components.mutations.modal.header', { id })"
    modal
    :pt="{
      root: { class: 'w-full max-w-[90vw] md:max-w-[33rem]' },
    }"
    :visible="visible"
    @show="addListenerOnDialogueOverlay(dialog)"
  >
    <div v-if="isLoading">
      <Skeleton class="h-2rem my-1 surface-300 w-5" />
      <Skeleton class="h-2rem my-1 surface-300 w-10" />
      <br />
      <Skeleton class="h-2rem my-1 surface-300 w-11" />
      <Skeleton class="h-2rem my-1 surface-300 w-11" />
    </div>

    <TransactionDetailModal
      v-else-if="shouldShowTransaction"
      :products-info="transactionProducts[props.id]"
      :transaction-info="transactionsDetails[props.id]"
    />
    <InvoiceDetailModal v-else-if="shouldShowInvoice" :invoice-info="transferDetails[props.id]" />
    <DepositDetailModal v-else-if="shouldShowDeposit" :deposit-info="transferDetails[props.id]" />
    <FineDetailModal v-else-if="shouldShowFine" :fine="transferDetails[props.id]" />
    <PayoutRequestDetailModal v-else-if="shouldShowPayoutRequest" :payout-request="transferDetails[props.id]" />
    <WaivedFineDetailModal v-else-if="shouldShowWaivedFine" :waived-fines="transferDetails[props.id]" />
    <template v-if="!shouldShowDeposit && !shouldShowInvoice && shouldShowDeleteButton" #footer>
      <div class="items-end flex flex-col">
        <Button severity="danger" @click="deleteMutation">
          {{ t('common.delete').toUpperCase() }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, type Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import type { TransactionResponse, TransferResponse } from '@sudosos/sudosos-client';
import type { SubTransactionResponse, SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';
import { addListenerOnDialogueOverlay, useUserStore } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import Skeleton from 'primevue/skeleton';
import { useTransactionStore } from '@/stores/transaction.store';
import { useTransferStore } from '@/stores/transfer.store';
import apiService from '@/services/ApiService';
import TransactionDetailModal from '@/components/mutations/mutationmodal/ModalDetailTransaction.vue';
import PayoutRequestDetailModal from '@/components/mutations/mutationmodal/ModalDetailPayoutRequest.vue';
import DepositDetailModal from '@/components/mutations/mutationmodal/ModalDetailDeposit.vue';
import InvoiceDetailModal from '@/components/mutations/mutationmodal/ModalDetailInvoice.vue';
import FineDetailModal from '@/components/mutations/mutationmodal/ModalDetailFine.vue';
import WaivedFineDetailModal from '@/components/mutations/mutationmodal/ModalDetailWaivedFine.vue';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import { FinancialMutationType } from '@/utils/mutationUtils';
import { UserRole } from '@/utils/rbacUtils';

const props = defineProps<{
  type: FinancialMutationType;
  id: number;
}>();

const { t } = useI18n();

const visible = ref<boolean>(false);
const transactionStore = useTransactionStore();
const transactionsDetails: Ref<{ [id: number]: TransactionResponse }> = ref({});
const transactionProducts: Ref<{ [id: number]: Array<SubTransactionRowResponse> }> = ref({});
const transferStore = useTransferStore();
const transferDetails: Ref<{ [id: number]: TransferResponse }> = ref({});
const dialog = ref();
const toast = useToast();
const userStore = useUserStore();
const isLoading: Ref<boolean> = ref(false);

const shouldShowDeleteButton = computed(() => {
  // If the transfer is not loaded yet, do not show the delete button.
  if (!transferDetails.value[props.id]) return false;
  return userStore.current.rolesWithPermissions.findIndex(
    (r) => (r.name as UserRole) == UserRole.BAC_PM || (r.name as UserRole) == UserRole.BOARD,
  );
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
  return props.type === FinancialMutationType.FINE;
});

const shouldShowWaivedFine = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.WAIVED_FINE;
});

const shouldShowPayoutRequest = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.PAYOUT_REQUEST;
});
async function fetchTransferInfo() {
  if (transferDetails.value[props.id]) return; // We already have content!
  await transferStore.fetchIndividualTransfer(props.id, apiService).then(() => {
    transferDetails.value[props.id] = transferStore.transfer as TransferResponse;
  });
}

function fetchTransactionInfo() {
  if (transactionsDetails.value[props.id]) return; // We already have content!
  transactionStore
    .fetchIndividualTransaction(props.id, apiService)
    .then(() => {
      if (!transactionStore.transaction) {
        void router.replace({ path: '/error' });
        return;
      }
      transactionsDetails.value[props.id] = transactionStore.transaction;
      getProductsOfTransaction(transactionStore.transaction); // Process subtransactions
    })
    .catch((err) => {
      handleError(err, toast);
    });
}

function getProductsOfTransaction(transactionResponse: TransactionResponse): void {
  if (transactionProducts.value[transactionResponse.id]) return; // We already have content!
  const result: Array<SubTransactionRowResponse> = [];
  transactionResponse.subTransactions.forEach((subTransaction: SubTransactionResponse) => {
    subTransaction.subTransactionRows.forEach((subTransactionRow: SubTransactionRowResponse) => {
      result.push(subTransactionRow);
    });
  });
  transactionProducts.value[transactionResponse.id] = result;
}

async function fetchMutation(): Promise<void> {
  if (props.type == FinancialMutationType.TRANSACTION) fetchTransactionInfo();
  else await fetchTransferInfo();
}

// Load on first mount
onMounted(async () => {
  isLoading.value = true;
  await fetchMutation();
  isLoading.value = false;
});

// Reload when closing and opening another
watch(
  () => props.id || props.type,
  async () => {
    isLoading.value = true;
    await fetchMutation();
    isLoading.value = false;
  },
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
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.fineDeleted'),
          severity: 'success',
          life: 3000,
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
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.transactionDeleted'),
          severity: 'success',
          life: 3000,
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
