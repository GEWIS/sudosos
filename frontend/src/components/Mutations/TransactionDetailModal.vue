<script setup lang="ts">
import { formatValueEuro } from "../../utils/mutationUtils";
import type { SubTransactionRowResponse } from "@sudosos/sudosos-client/src/api";
import type { TransactionResponse } from "@sudosos/sudosos-client";

defineProps({
  transactionInfo: {
    type: Object as () => TransactionResponse,
    required: true,
  },
  productsInfo: {
    type: Object as () => Array<SubTransactionRowResponse>,
    required: true
  }
});

</script>

<template>
  <div class="flex flex-column">
    <div class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.total") }}</p></div>
      <div class="transaction-right-column"><p>{{ formatValueEuro(transactionInfo.totalPriceInclVat) }}</p></div>
    </div>
    <div class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.pos") }}</p></div>
      <div class="transaction-right-column"><p>{{ transactionInfo.pointOfSale.name }}</p></div>
    </div>
    <div class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.boughtBy") }}</p></div>
      <div class="transaction-right-column">
        <p>
          {{ transactionInfo.from.firstName }}
          {{ transactionInfo.from.lastName }}
        </p>
      </div>
    </div>
    <div v-if="transactionInfo.createdBy" class="flex flex-row justify-content-between" >
      <div class="transaction-left-column">
        <p>{{ $t("transactions.putInBy") }}
      </p>
      </div>
      <div class="transaction-right-column">
        <p>
          {{ transactionInfo.createdBy.firstName }}
          {{ transactionInfo.createdBy.lastName }}
        </p>
      </div>
    </div>
    <div class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.products") }}</p></div>
      <div class="transaction-right-column">
        <div v-for="transactionProduct in productsInfo" :key="transactionProduct.id" class="product-row">
          <div class="product-row-left-column">
            <p>{{ transactionProduct.amount }} x {{ transactionProduct.product.name }}</p>
          </div>
          <div class="product-row-right-column">
            <p>
              ({{ formatValueEuro(transactionProduct.product.priceInclVat) }})
              = {{ formatValueEuro(transactionProduct.totalPriceInclVat) }}
            </p>
          </div>
        </div>
        <div class="product-row-total">
          <p><i>{{ $t("transactions.total") }}</i> {{ formatValueEuro(transactionInfo.totalPriceInclVat) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
