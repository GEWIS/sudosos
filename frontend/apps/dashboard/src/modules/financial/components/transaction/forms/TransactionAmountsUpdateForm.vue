<template>
  <TransactionAmountsBaseForm
    :containers="containers"
    :edit="edit"
    :form="form"
    :product-options="productOptions"
    :product-to-container-map="productToContainerMap"
    :transaction="transaction"
  />
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import type { TransactionResponse, ProductResponse, ContainerResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import type { AxiosError } from 'axios';
import TransactionAmountsBaseForm from './TransactionAmountsBaseForm.vue';
import { type Form, setSubmit } from '@/utils/formUtils';
import { updateTransactionAmountsObject } from '@/utils/validation-schema';
import { useTransactionStore } from '@/stores/transaction.store';
import { handleError } from '@/utils/errorUtils';
import { transactionResponseToRequest } from '@/utils/transactionUtil';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const toast = useToast();
const transactionStore = useTransactionStore();

const props = defineProps({
  transaction: {
    type: Object as PropType<TransactionResponse>,
    required: true,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateTransactionAmountsObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
  productOptions: {
    type: Array as PropType<ProductResponse[]>,
    required: true,
  },
  containers: {
    type: Array as PropType<ContainerResponse[]>,
    required: true,
  },
  productToContainerMap: {
    type: Object as PropType<Map<number, ContainerResponse>>,
    required: true,
  },
});

const emit = defineEmits<{
  'update:edit': [value: boolean];
}>();

// Set up the form submission handler
setSubmit(props.form, async () => {
  const values = props.form.context.values;
  if (!props.form.context.meta.value.dirty) {
    emit('update:edit', false);
    return;
  }

  try {
    // Get the updated amounts from form values
    const updatedAmounts = values.updatedAmounts as Array<{
      subTransactionIndex: number;
      rowIndex: number;
      amount: number;
      isNewProduct?: boolean;
      productId?: number;
      productRevision?: number;
      containerId?: number;
      containerRevision?: number;
      toUserId?: number;
    }>;

    if (!updatedAmounts || updatedAmounts.length === 0) {
      throw new Error(t('modules.admin.transactions.missingAmountsData'));
    }

    // Reconstruct the full transaction request
    const fullTransactionRequest = transactionResponseToRequest(props.transaction);

    // Separate existing product updates from new products
    const existingProductUpdates = updatedAmounts.filter((item) => !item.isNewProduct);
    const newProducts = updatedAmounts.filter((item) => item.isNewProduct);

    // Apply the amount changes to existing products and recalculate prices
    existingProductUpdates.forEach(({ subTransactionIndex, rowIndex, amount }) => {
      if (fullTransactionRequest.subTransactions[subTransactionIndex]?.subTransactionRows[rowIndex]) {
        const row = fullTransactionRequest.subTransactions[subTransactionIndex].subTransactionRows[rowIndex];
        const originalRow = props.transaction.subTransactions[subTransactionIndex].subTransactionRows[rowIndex];

        // Update amount
        row.amount = amount;

        // Recalculate totalPriceInclVat for this row
        // Use the original price per unit to calculate new total
        const pricePerUnit = originalRow.amount > 0 ? originalRow.totalPriceInclVat.amount / originalRow.amount : 0;
        row.totalPriceInclVat = {
          amount: Math.round(amount * pricePerUnit),
          currency: originalRow.totalPriceInclVat.currency,
          precision: originalRow.totalPriceInclVat.precision,
        };
      }
    });

    // Handle new products - group by container/owner (similar to cart.store.ts logic)
    const newProductsByContainer: { [key: string]: Array<(typeof newProducts)[0]> } = {};
    newProducts.forEach((newProduct) => {
      const containerKey = `${newProduct.containerId}-${newProduct.toUserId}`;
      if (!newProductsByContainer[containerKey]) {
        newProductsByContainer[containerKey] = [];
      }
      newProductsByContainer[containerKey].push(newProduct);
    });

    // Get POS revision data to fetch product prices
    const allProducts = props.productOptions;

    // Add new products to appropriate sub-transactions
    Object.values(newProductsByContainer).forEach((containerProducts) => {
      const firstProduct = containerProducts[0];
      const containerId = firstProduct.containerId!;
      const toUserId = firstProduct.toUserId!;
      const containerRevision = firstProduct.containerRevision!;

      // Check if a sub-transaction for this container already exists
      const existingSubTransaction = fullTransactionRequest.subTransactions.find(
        (st) => st.to === toUserId && st.container.id === containerId,
      );

      if (existingSubTransaction) {
        // Add new rows to existing sub-transaction
        containerProducts.forEach((newProduct) => {
          const product = allProducts.find((p) => p.id === newProduct.productId);
          const pricePerUnit = product?.priceInclVat.amount || 0;

          existingSubTransaction.subTransactionRows.push({
            amount: newProduct.amount,
            product: {
              id: newProduct.productId!,
              revision: newProduct.productRevision!,
            },
            totalPriceInclVat: {
              currency: product?.priceInclVat.currency || 'EUR',
              precision: product?.priceInclVat.precision || 2,
              amount: Math.round(newProduct.amount * pricePerUnit),
            },
          });
        });
      } else {
        // Create new sub-transaction
        const newSubTransactionRows = containerProducts.map((newProduct) => {
          const product = allProducts.find((p) => p.id === newProduct.productId);
          const pricePerUnit = product?.priceInclVat.amount || 0;

          return {
            amount: newProduct.amount,
            product: {
              id: newProduct.productId!,
              revision: newProduct.productRevision!,
            },
            totalPriceInclVat: {
              currency: product?.priceInclVat.currency || 'EUR',
              precision: product?.priceInclVat.precision || 2,
              amount: Math.round(newProduct.amount * pricePerUnit),
            },
          };
        });

        fullTransactionRequest.subTransactions.push({
          to: toUserId,
          container: {
            id: containerId,
            revision: containerRevision,
          },
          subTransactionRows: newSubTransactionRows,
          totalPriceInclVat: {
            currency: 'EUR',
            precision: 2,
            amount: 0, // This will be recalculated below
          },
        });
      }
    });

    // Remove items with amount 0 from sub-transactions
    fullTransactionRequest.subTransactions.forEach((subTransaction) => {
      subTransaction.subTransactionRows = subTransaction.subTransactionRows.filter((row) => (row.amount ?? 0) > 0);
    });

    // Remove empty sub-transactions
    fullTransactionRequest.subTransactions = fullTransactionRequest.subTransactions.filter(
      (subTransaction) => subTransaction.subTransactionRows.length > 0,
    );

    // Check if transaction would be empty after removing items
    if (fullTransactionRequest.subTransactions.length === 0) {
      throw new Error(t('modules.admin.transactions.cannotRemoveAllItems'));
    }

    // Recalculate sub-transaction totals
    fullTransactionRequest.subTransactions.forEach((subTransaction) => {
      let subTotalAmount = 0;
      let currency = 'EUR';
      let precision = 2;

      subTransaction.subTransactionRows.forEach((row) => {
        subTotalAmount += row.totalPriceInclVat.amount;
        currency = row.totalPriceInclVat.currency;
        precision = row.totalPriceInclVat.precision;
      });

      subTransaction.totalPriceInclVat = {
        amount: subTotalAmount,
        currency,
        precision,
      };
    });

    // Recalculate overall transaction total
    let transactionTotalAmount = 0;
    let currency = 'EUR';
    let precision = 2;

    fullTransactionRequest.subTransactions.forEach((subTransaction) => {
      transactionTotalAmount += subTransaction.totalPriceInclVat.amount;
      currency = subTransaction.totalPriceInclVat.currency;
      precision = subTransaction.totalPriceInclVat.precision;
    });

    fullTransactionRequest.totalPriceInclVat = {
      amount: transactionTotalAmount,
      currency,
      precision,
    };

    // Submit the complete transaction
    await transactionStore.updateTransaction(props.transaction.id, fullTransactionRequest, apiService);

    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('modules.admin.transactions.amountsUpdated'),
      life: 3000,
    });

    emit('update:edit', false);
  } catch (error) {
    handleError(error as AxiosError, toast);
  }
});
</script>
