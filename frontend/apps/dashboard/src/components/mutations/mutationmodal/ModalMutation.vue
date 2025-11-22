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
      v-else-if="transaction && products"
      :products-info="products"
      :transaction-info="transaction"
    />
    <template v-else-if="transfer">
      <InvoiceDetailModal v-if="isType('invoice').value" :invoice-info="transfer" />
      <DepositDetailModal v-else-if="isType('deposit').value" :deposit-info="transfer" />
      <FineDetailModal v-else-if="isType('fine').value" :fine="transfer" />
      <PayoutRequestDetailModal v-else-if="isType('payoutRequest').value" :payout-request="transfer" />
      <WaivedFineDetailModal v-else-if="isType('waivedFine').value" :waived-fines="transfer" />
    </template>

    <template v-if="canDelete || canEdit" #footer>
      <div class="items-end flex gap-2">
        <div v-if="canEdit" class="flex justify-end">
          <Button icon="pi pi-pencil" :label="t('common.edit')" @click="editTransaction" />
        </div>
        <div v-if="canDelete" class="flex justify-end">
          <ConfirmButton
            :disabled="false"
            icon="pi pi-trash"
            :initial-label="t('common.delete')"
            type="submit"
            @confirm="deleteMutation"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { addListenerOnDialogueOverlay, isAllowed } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';
import apiService from '@/services/ApiService';
import TransactionDetailModal from '@/components/mutations/mutationmodal/ModalDetailTransaction.vue';
import PayoutRequestDetailModal from '@/components/mutations/mutationmodal/ModalDetailPayoutRequest.vue';
import DepositDetailModal from '@/components/mutations/mutationmodal/ModalDetailDeposit.vue';
import InvoiceDetailModal from '@/components/mutations/mutationmodal/ModalDetailInvoice.vue';
import FineDetailModal from '@/components/mutations/mutationmodal/ModalDetailFine.vue';
import WaivedFineDetailModal from '@/components/mutations/mutationmodal/ModalDetailWaivedFine.vue';
import router from '@/router';
import { FinancialMutationType, isTransaction } from '@/utils/mutationUtils';
import ConfirmButton from '@/components/ConfirmButton.vue';
import { useMutationDetails } from '@/composables/mutationDetails';

const props = defineProps<{ type: FinancialMutationType; id: number }>();

const { isLoading, transaction, transfer, products, canDelete } = useMutationDetails(
  toRef(props, 'type'),
  toRef(props, 'id'),
);

const { t } = useI18n();

// Check if user can edit transactions
const canEdit = computed(() => isTransaction(props.type) && isAllowed('update', ['all'], 'Transaction', ['any']));

const visible = ref<boolean>(false);
const dialog = ref();
const toast = useToast();

const isType = (t: string) => computed(() => detailType.value === t);
const detailType = computed(() => {
  if (!transfer.value && props.type !== FinancialMutationType.TRANSACTION) return null;
  switch (props.type) {
    case FinancialMutationType.INVOICE:
      return 'invoice';
    case FinancialMutationType.DEPOSIT:
      return 'deposit';
    case FinancialMutationType.PAYOUT_REQUEST:
      return 'payoutRequest';
    case FinancialMutationType.FINE:
      return 'fine';
    case FinancialMutationType.WAIVED_FINE:
      return 'waivedFine';
    case FinancialMutationType.TRANSACTION:
      return transaction.value ? 'transaction' : null;
    default:
      return null;
  }
});

const editTransaction = () => {
  if (transaction.value) {
    dialog.value.close();
    void router.push({ name: 'financial-transactions', query: { id: transaction.value.id.toString() } });
  }
};

const deleteMutation = async () => {
  // Only allow deleting when permitted
  if (!canDelete.value) return;

  try {
    if (props.type === FinancialMutationType.FINE && transfer.value?.fine) {
      await apiService.debtor.deleteFine(transfer.value.fine.id);
      toast.add({
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.fineDeleted'),
        severity: 'success',
        life: 3000,
      });
      dialog.value.close();
    } else if (props.type === FinancialMutationType.TRANSACTION && transaction.value) {
      await apiService.transaction.deleteTransaction(transaction.value.id);
      toast.add({
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.transactionDeleted'),
        severity: 'success',
        life: 3000,
      });
    } else {
      await router.replace({ path: '/error' });
      return;
    }
    dialog.value.close();
  } catch (err) {
    console.error(err);
  }
};
</script>

<style scoped lang="scss"></style>
