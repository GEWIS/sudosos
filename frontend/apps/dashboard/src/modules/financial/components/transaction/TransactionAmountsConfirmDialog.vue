<template>
  <Dialog
    :header="t('modules.admin.transactions.confirmAmountsEdit')"
    modal
    :style="{ width: '35rem' }"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <div>
        <p class="mb-3">{{ t('modules.admin.transactions.confirmAmountsMessage') }}</p>

        <div class="flex flex-col gap-2">
          <div class="flex flex-row gap-2">
            <span class="font-semibold">{{ t('common.id') }}:</span>
            <span>{{ transaction.id }}</span>
          </div>

          <!-- Amount Changes -->
          <div class="flex flex-col gap-2 mt-3">
            <span class="font-semibold">{{ t('modules.admin.transactions.amountChanges') }}:</span>
            <div class="flex flex-col gap-1">
              <div
                v-for="change in amountChanges"
                :key="`${change.subTransactionIndex}-${change.rowIndex}`"
                class="flex flex-row gap-2 items-center p-2"
              >
                <span class="flex-1">{{ change.productName }}</span>
                <span>{{ change.oldAmount }}x</span>
                <i class="pi pi-arrow-right"></i>
                <span class="font-semibold">{{ change.newAmount }}x</span>
              </div>
            </div>
          </div>

          <!-- New Products Added -->
          <div v-if="newProductsAdded.length > 0" class="flex flex-col gap-2 mt-3">
            <span class="font-semibold">{{ t('modules.admin.transactions.newProductsAdded') }}:</span>
            <div class="flex flex-col gap-1">
              <div
                v-for="newProduct in newProductsAdded"
                :key="`new-${newProduct.productId}`"
                class="flex flex-row gap-2 items-center p-2"
              >
                <span class="flex-1">{{ newProduct.productName }}</span>
                <span class="font-semibold">{{ newProduct.amount }}x</span>
                <span class="text-sm font-semibold">({{ t('modules.admin.transactions.newProduct') }})</span>
              </div>
            </div>
          </div>

          <!-- Cost Change Highlight -->
          <div class="flex flex-col gap-2 mt-3 p-3">
            <span class="font-semibold">{{ t('modules.admin.transactions.costChange') }}:</span>
            <div class="flex flex-row gap-2 items-center">
              <span>{{ formatPrice({ amount: oldTotalCost, currency: 'EUR', precision: 2 }) }}</span>
              <i class="pi pi-arrow-right"></i>
              <span class="font-bold">{{ formatPrice({ amount: newTotalCost, currency: 'EUR', precision: 2 }) }}</span>
              <span class="font-semibold px-2 py-1 rounded text-sm">
                {{ costDifference >= 0 ? '+' : ''
                }}{{ formatPrice({ amount: costDifference, currency: 'EUR', precision: 2 }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button :label="t('common.cancel')" severity="secondary" @click="handleCancel" />
        <Button :label="t('common.confirm')" @click="handleConfirm" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import type { TransactionResponse, ProductResponse } from '@sudosos/sudosos-client';
import { formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  transaction: TransactionResponse;
  updatedAmounts: Array<{
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
  productOptions: ProductResponse[];
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  confirm: [];
  cancel: [];
}>();

// Calculate amount changes and cost differences
const amountChanges = computed(() => {
  const changes: Array<{
    subTransactionIndex: number;
    rowIndex: number;
    productName: string;
    oldAmount: number;
    newAmount: number;
  }> = [];

  props.updatedAmounts.forEach(({ subTransactionIndex, rowIndex, amount, isNewProduct }) => {
    // Skip new products - they don't have existing rows to compare
    if (isNewProduct) return;

    const subTransaction = props.transaction.subTransactions[subTransactionIndex];
    const row = subTransaction.subTransactionRows[rowIndex];
    const oldAmount = row.amount;

    if (oldAmount !== amount) {
      changes.push({
        subTransactionIndex,
        rowIndex,
        productName: row.product.name,
        oldAmount,
        newAmount: amount,
      });
    }
  });

  return changes;
});

const newProductsAdded = computed(() => {
  const newProducts: Array<{
    productId: number;
    productName: string;
    amount: number;
  }> = [];

  props.updatedAmounts.forEach(({ isNewProduct, productId, amount }) => {
    const product = props.productOptions.find((p) => p.id === productId);
    if (isNewProduct && productId) {
      newProducts.push({
        productId,
        productName: product ? product.name : `Product ${productId}`,
        amount,
      });
    }
  });

  return newProducts;
});

const oldTotalCost = computed(() => {
  const cost = props.transaction.totalPriceInclVat.amount;
  return isNaN(cost) ? 0 : cost;
});

const newTotalCost = computed(() => {
  let total = 0;

  // Calculate cost for existing sub-transactions
  props.transaction.subTransactions.forEach((subTransaction, stIndex) => {
    subTransaction.subTransactionRows.forEach((row, rIndex) => {
      const updatedAmount = props.updatedAmounts.find(
        (ua) => ua.subTransactionIndex === stIndex && ua.rowIndex === rIndex,
      );

      if (updatedAmount) {
        // Use the same calculation logic as the update form
        const pricePerUnit = row.amount > 0 ? row.totalPriceInclVat.amount / row.amount : 0;
        const rowTotal = updatedAmount.amount * pricePerUnit;
        total += isNaN(rowTotal) ? 0 : rowTotal;
      } else {
        // Use original amount if not updated
        total += isNaN(row.totalPriceInclVat.amount) ? 0 : row.totalPriceInclVat.amount;
      }
    });
  });

  // Add cost for new products
  props.updatedAmounts.forEach(({ isNewProduct, productId, amount }) => {
    if (isNewProduct && productId && amount) {
      const product = props.productOptions.find((p) => p.id === productId);
      if (product) {
        const pricePerUnit = product.priceInclVat.amount;
        const productTotal = amount * pricePerUnit;
        total += isNaN(productTotal) ? 0 : productTotal;
      }
    }
  });

  return isNaN(total) ? 0 : total;
});

const costDifference = computed(() => {
  const difference = newTotalCost.value - oldTotalCost.value;
  return isNaN(difference) ? 0 : difference;
});

function handleConfirm() {
  emit('confirm');
  emit('update:visible', false);
}

function handleCancel() {
  emit('cancel');
  emit('update:visible', false);
}
</script>
