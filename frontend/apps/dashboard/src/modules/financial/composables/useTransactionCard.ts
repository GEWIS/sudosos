import { computed, ref } from 'vue';
import type { TransactionResponse } from '@sudosos/sudosos-client';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import { useTransactionStore } from '@/stores/transaction.store';

export function useTransactionCard(transactionId: number) {
  const transactionStore = useTransactionStore();
  const transaction = computed(() => transactionStore.getTransaction(transactionId) as TransactionResponse);
  const canEdit = computed(() => isAllowed('get', ['all'], 'Transaction', ['any']));
  const edit = ref(false);

  return { transaction, canEdit, edit };
}
