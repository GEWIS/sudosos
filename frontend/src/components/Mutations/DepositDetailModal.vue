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
      <div class="transaction-left-column"><p>{{ $t("transactions.total") }}</p></div>
      <div class="transaction-right-column"><p>{{ formatPrice(depositInfo.amount) }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>{{ $t("transactions.to") }}</p></div>
      <div class="transaction-right-column">
        <p>{{ depositInfo.deposit?.to.firstName + ' ' +depositInfo.deposit?.to.lastName }}</p>
      </div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>{{ $t("transactions.transferRef") }}</p></div>
      <div class="transaction-right-column"><p>{{ depositInfo.deposit?.stripeId }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>{{ $t("transactions.transferType") }}</p></div>
      <div class="transaction-right-column"><p>{{ $t("transactions.deposit") }}</p></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../styles/Modal.css';
</style>
