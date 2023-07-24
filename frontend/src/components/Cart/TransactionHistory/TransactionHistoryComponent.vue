<template>
  <div class="transaction-history-table-container">
    <h3>Recent Transactions:</h3>
    <TransactionHistoryRowComponent
      v-for="transaction in transactions"
      :key="transaction.id"
      :transaction="transaction"
      :open="transaction.id === openId"
      @update:open="showMoreInfo($event)"
    />
  </div>
</template>

<script setup lang="ts">
import {TransactionResponse} from "@sudosos/sudosos-client";
import TransactionHistoryRowComponent
  from "@/components/Cart/TransactionHistory/TransactionHistoryRowComponent.vue";
import {computed, Ref, ref, watch} from "vue";

const props = defineProps({
  transactions: {
    type: Object as () => TransactionResponse[],
    required: true,
  }
})

const firstId = computed(() => {
  if (!props.transactions[0]) return undefined;
  return props.transactions[0].id
})

watch(props.transactions, () => {
  if (openId.value === null) openId.value = firstId.value;
})

const openId: Ref<number | undefined | null> = ref(null);

const showMoreInfo = (event: number) => {
  if (openId.value === event) openId.value = undefined;
  else openId.value = event;
}

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
