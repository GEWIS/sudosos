<script setup lang="ts">
import { formatValueEuro } from "../../utils/mutationUtils";
import { TransferResponse } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
const props =  defineProps({
  depositInfo: {
    type: Object as () => TransferResponse,
    required: true,
  }
});
</script>

<template>
  <CardComponent header="Deposit Details">
    <div class="content-wrapper">
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Total:</p></div>
        <div class="transaction-right-column"><p>{{ formatValueEuro(depositInfo.amount) }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>To:</p></div>
        <div class="transaction-right-column"><p>{{ depositInfo.deposit.to.firstName + ' ' +depositInfo.deposit.to.lastName }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Transfer Reference:</p></div>
        <div class="transaction-right-column"><p>{{ depositInfo.deposit.stripeId }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Transfer Type:</p></div>
        <div class="transaction-right-column"><p>Deposit</p></div>
      </div>
    </div>
  </CardComponent>
</template>

<style scoped lang="scss">
@import '../../styles/Modal.css';
</style>