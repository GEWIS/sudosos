<script setup lang="ts">
import type { TransferResponse } from "@sudosos/sudosos-client";
import { formatPrice } from "../../utils/formatterUtils";
defineProps({
  depositInfo: {
    type: Object as () => TransferResponse,
    required: true,
  }
});


</script>

<template>
  <div class="content-wrapper">
    <div class="transaction-row">
      <div class="transaction-left-column"><p>Total:</p></div>
      <div class="transaction-right-column"><p>{{ formatPrice(depositInfo.amount) }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>To:</p></div>
      <div class="transaction-right-column"><p>{{ depositInfo.deposit?.to.firstName + ' ' +depositInfo.deposit?.to.lastName }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>Transfer Reference:</p></div>
      <div class="transaction-right-column"><p>{{ depositInfo.deposit?.stripeId }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>Transfer Type:</p></div>
      <div class="transaction-right-column"><p>Deposit</p></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../styles/Modal.css';
</style>
