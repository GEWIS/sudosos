<template>
  <div class="transaction-history-table-container">
    <h3>Recent Transactions:</h3>
    <TransactionHistoryRowComponent
      v-for="transaction in transactions"
      :key="transaction.id"
      :transaction="transaction"
    />
  </div>
</template>

<script setup lang="ts">
import {TransactionResponse} from "@sudosos/sudosos-client";
import TransactionHistoryRowComponent
  from "@/components/Cart/TransactionHistory/TransactionHistoryRowComponent.vue";

const props = defineProps({
  transactions: {
    type: Object as () => TransactionResponse[],
    required: true,
  }
})

</script>

<style scoped>
.transaction-history-table-container {
  margin-top: 12px;
  height: 100%;
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: auto;
  > h3 {
    font-weight: 500;
  }
}
</style>
