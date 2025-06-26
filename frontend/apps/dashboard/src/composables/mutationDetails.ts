import { ref, computed, watch, type Ref } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/transaction.store';
import { useTransferStore } from '@/stores/transfer.store';
import apiService from '@/services/ApiService';
import { FinancialMutationType } from '@/utils/mutationUtils';
import { getProductsOfTransaction } from '@/utils/transactionUtil';
import { UserRole } from '@/utils/rbacUtils';

export function useMutationDetails(type: Ref<FinancialMutationType>, id: Ref<number>, immediate: boolean = true) {
  const transactionStore = useTransactionStore();
  const transferStore = useTransferStore();
  const { current } = storeToRefs(useUserStore());
  const isLoading = ref(false);

  // Transaction and transfer data as computed (from stores)
  const transaction = computed(() => transactionStore.getTransaction(id.value));
  const transfer = computed(() => transferStore.getTransfer(id.value));

  // Computed products for transaction
  const products = computed(() => {
    if (transaction.value) return getProductsOfTransaction(transaction.value);
    return [];
  });

  // Generic fetch, depending on type
  async function fetchMutation() {
    isLoading.value = true;
    try {
      if (type.value === FinancialMutationType.TRANSACTION) {
        if (!transaction.value) await transactionStore.fetchIndividualTransaction(id.value, apiService);
      } else {
        if (!transfer.value) await transferStore.fetchIndividualTransfer(id.value, apiService);
      }
    } finally {
      isLoading.value = false;
    }
  }

  // Check if the user can delete the mutation
  const deletable = [FinancialMutationType.FINE, FinancialMutationType.TRANSACTION];
  const canDelete = computed(() => {
    const isLoaded =
      (type.value === FinancialMutationType.TRANSACTION && transaction.value) ||
      (type.value !== FinancialMutationType.TRANSACTION && transfer.value);

    const hasPermission = current.value.rolesWithPermissions.some(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      (r) => r.name === UserRole.BAC_PM || r.name === UserRole.BOARD,
    );

    const isDeletable = deletable.includes(type.value);

    return isLoaded && hasPermission && isDeletable;
  });

  // Fetch on mount & whenever id/type change
  watch([type, id], fetchMutation, { immediate });

  return {
    isLoading,
    transaction,
    transfer,
    products,
    fetchMutation,
    canDelete,
  };
}
