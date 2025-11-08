<template>
  <div class="flex flex-col gap-4">
    <div v-if="!edit" class="flex flex-col gap-2">
      <span class="font-semibold">{{ t('modules.admin.transactions.currentAmounts') }}:</span>
      <div class="flex flex-col gap-2">
        <div
          v-for="product in products"
          :key="`${product.subTransactionIndex}-${product.rowIndex}`"
          class="flex flex-row gap-2 items-center"
        >
          <span class="w-8 text-right">{{ product.amount }}x</span>
          <span class="flex-1">{{ product.product.name }}</span>
          <span class="font-semibold">{{ formatPrice(product.totalPriceInclVat) }}</span>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <span class="font-semibold">{{ t('modules.admin.transactions.editAmounts') }}:</span>
      <div class="flex flex-col gap-2">
        <div
          v-for="product in products"
          :key="`${product.subTransactionIndex}-${product.rowIndex}`"
          class="flex flex-row items-center gap-2"
        >
          <InputNumber
            class="max-w-20"
            :disabled="!edit"
            fluid
            :max="999"
            :min="0"
            :model-value="product.amount"
            suffix="x"
            @update:model-value="updateAmount(product.subTransactionIndex, product.rowIndex, $event)"
          />
          <div class="flex-1">
            {{ product.product.name }}
            <span v-if="product.isNewProduct" class="text-blue-500 text-sm ml-2 font-semibold"
              >({{ t('modules.admin.transactions.newProduct') }})</span
            >
            <span v-if="product.amount === 0" class="text-red-500 text-sm ml-2"
              >({{ t('modules.admin.transactions.willBeRemoved') }})</span
            >
          </div>
          <span class="font-semibold">{{ formatPrice(product.totalPriceInclVat) }}</span>
        </div>
        <div class="flex flex-row gap-2 items-center mt-2">
          <Select
            v-model="selectedProduct"
            auto-filter-focus
            class="flex-1"
            :filter="true"
            :filter-fields="['name']"
            option-label="name"
            :options="pOptions"
            :placeholder="t('modules.admin.transactions.selectProduct')"
          />
          <Button
            :disabled="!selectedProduct"
            :label="t('modules.admin.transactions.addProduct')"
            @click="addNewProduct"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import type {
  BaseProductResponse,
  ProductResponse,
  TransactionResponse,
  ContainerResponse,
} from '@sudosos/sudosos-client';
import * as yup from 'yup';
import type { DineroObjectResponse } from '@sudosos/sudosos-client/src/api';
import type { Form } from '@/utils/formUtils';
import { formatPrice } from '@/utils/formatterUtils';
import { type UpdateAmountItem, updateTransactionAmountsObject } from '@/utils/validation-schema';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateTransactionAmountsObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: true,
  },
  transaction: {
    type: Object as PropType<TransactionResponse>,
    required: true,
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

const selectedProduct = ref<{ name: string; value: ProductResponse } | null>(null);

// Use computed properties to reactively access props data
const productOptionsData = computed(() => props.productOptions);
const containers = computed(() => props.containers);
const productToContainerMap = computed(() => props.productToContainerMap);

const pOptions = computed(() => {
  if (!productOptionsData.value || productOptionsData.value.length === 0) {
    return [];
  }
  return productOptionsData.value.map((product) => ({
    name: product.name,
    value: product,
  }));
});

const products = computed(() => {
  if (!props.transaction) return [];

  const updatedAmounts = props.form.context.values.updatedAmounts || [];
  const result: {
    subTransactionIndex: number;
    rowIndex: number;
    amount: number;
    totalPriceInclVat: DineroObjectResponse;
    product: BaseProductResponse;
    isNewProduct?: boolean;
  }[] = [];

  // Iterate through sub-transactions and their rows directly
  props.transaction.subTransactions.forEach((subTransaction, subTransactionIndex) => {
    subTransaction.subTransactionRows.forEach((row, rowIndex) => {
      // Check if this product has an updated amount
      const updatedAmount = updatedAmounts.find(
        (ua: UpdateAmountItem) => ua.subTransactionIndex === subTransactionIndex && ua.rowIndex === rowIndex,
      );

      // Calculate the correct total price for display
      let displayTotalPrice = row.totalPriceInclVat;
      if (updatedAmount) {
        const pricePerUnit = row.amount > 0 ? row.totalPriceInclVat.amount / row.amount : 0;
        displayTotalPrice = {
          amount: Math.round(updatedAmount.amount * pricePerUnit),
          currency: row.totalPriceInclVat.currency,
          precision: row.totalPriceInclVat.precision,
        };
      }

      result.push({
        ...row,
        subTransactionIndex,
        rowIndex,
        amount: updatedAmount ? updatedAmount.amount : row.amount, // Use updated amount if available
        totalPriceInclVat: displayTotalPrice, // Use calculated total price
        isNewProduct: updatedAmount?.isNewProduct || false,
      });
    });
  });

  // Add new products that don't exist in the original transaction
  updatedAmounts.forEach((updatedAmount: UpdateAmountItem) => {
    if (updatedAmount.isNewProduct) {
      const product = productOptionsData.value.find((p) => p.id === updatedAmount.productId);
      if (product) {
        const container = containers.value.find((c) => c.id === updatedAmount.containerId);
        if (container) {
          result.push({
            subTransactionIndex: updatedAmount.subTransactionIndex,
            rowIndex: updatedAmount.rowIndex,
            amount: updatedAmount.amount,
            totalPriceInclVat: {
              amount: updatedAmount.amount * product.priceInclVat.amount,
              currency: product.priceInclVat.currency,
              precision: product.priceInclVat.precision,
            },
            product: product,
            isNewProduct: true,
          });
        }
      }
    }
  });

  return result;
});

function updateAmount(subTransactionIndex: number, rowIndex: number, amount: number | null) {
  if (amount === null) return;

  // Update the form context - create a new array to trigger reactivity
  const currentAmounts = [...(props.form.context.values.updatedAmounts || [])];
  const existingIndex = currentAmounts.findIndex(
    (item: UpdateAmountItem) => item.subTransactionIndex === subTransactionIndex && item.rowIndex === rowIndex,
  );

  if (existingIndex >= 0) {
    currentAmounts[existingIndex] = { ...currentAmounts[existingIndex], amount };
  } else {
    currentAmounts.push({ subTransactionIndex, rowIndex, amount });
  }

  props.form.context.setFieldValue('updatedAmounts', currentAmounts);
}

function addNewProduct() {
  if (!selectedProduct.value || !selectedProduct.value.value) return;

  const product = selectedProduct.value.value;
  if (!product || !product.id) return;

  const container = productToContainerMap.value.get(product.id);

  if (!container) return;

  // Check if this product is already in the transaction
  const existingProduct = products.value.find((p) => p.product.id === product.id);
  if (existingProduct) {
    // Product already exists, just increase amount
    updateAmount(existingProduct.subTransactionIndex, existingProduct.rowIndex, existingProduct.amount + 1);
    selectedProduct.value = null;
    return;
  }

  // Find the next available sub-transaction index for this container
  const existingSubTransaction = props.transaction.subTransactions.find((st) => st.container.id === container.id);
  let subTransactionIndex: number;
  let rowIndex: number;

  if (existingSubTransaction) {
    // Add to existing sub-transaction
    subTransactionIndex = props.transaction.subTransactions.findIndex((st) => st.container.id === container.id);
    rowIndex = existingSubTransaction.subTransactionRows.length; // Add as new row
  } else {
    // Create new sub-transaction
    subTransactionIndex = props.transaction.subTransactions.length; // Add as new sub-transaction
    rowIndex = 0; // First row in new sub-transaction
  }

  const currentAmounts = [...(props.form.context.values.updatedAmounts || [])];
  currentAmounts.push({
    subTransactionIndex,
    rowIndex,
    amount: 1,
    isNewProduct: true,
    productId: product.id,
    productRevision: product.revision,
    containerId: container.id,
    containerRevision: container.revision,
    toUserId: container.owner.id,
  });

  props.form.context.setFieldValue('updatedAmounts', currentAmounts);
  selectedProduct.value = null;
}
</script>
