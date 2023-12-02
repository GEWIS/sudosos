<script setup lang="ts">
import { formatValueEuro } from "../../utils/mutationUtils";
import { SubTransactionRowResponse } from "@sudosos/sudosos-client/src/api";

const props = defineProps({
  transactionInfo: {
    type: Object as () => SubTransactionRowResponse,
    required: true,
  },
  productsInfo: {
    type: Object as () => Array<SubTransactionRowResponse>,
    required: true
  }
});

</script>

<template>
  <div class="content-wrapper">
    <div class="transaction-row">
      <div class="transaction-left-column"><p>Total</p></div>
      <div class="transaction-right-column"><p>{{ formatValueEuro(transactionInfo.totalPriceInclVat) }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>Point of sale</p></div>
      <div class="transaction-right-column"><p>{{ transactionInfo.pointOfSale.name }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>Bought by</p></div>
      <div class="transaction-right-column"><p> {{ transactionInfo.from.firstName }} {{
          transactionInfo.from.lastName
        }}</p></div>
    </div>
    <div v-if="transactionInfo.createdBy" class="transaction-row" >
      <div class="transaction-left-column"><p>Put in by</p></div>
      <div class="transaction-right-column"><p> {{ transactionInfo.createdBy.firstName }}
        {{ transactionInfo.createdBy.lastName }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>Products</p></div>
      <div class="transaction-right-column">
        <div v-for="transactionProduct in productsInfo" :key="transactionProduct.id" class="product-row">
          <div class="product-row-left-column"><p>{{ transactionProduct.amount }} x {{ transactionProduct.product.name }}</p></div>
          <div class="product-row-right-column"> <p>({{ formatValueEuro(transactionProduct.product.priceInclVat) }}) = {{ formatValueEuro(transactionProduct.totalPriceInclVat) }} </p></div>
        </div>
        <div class="product-row-total">
          <p><i>Total</i> {{ formatValueEuro(transactionInfo.totalPriceInclVat) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../styles/Modal.css';
</style>