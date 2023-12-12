<script setup lang="ts">
import { formatValueEuro } from "../../utils/mutationUtils";
import type { TransferResponse } from "@sudosos/sudosos-client";

defineProps({
  invoiceInfo: {
    type: Object as () => TransferResponse,
    required: true,
  }
});
</script>

<template>
  <div class="content-wrapper">
    <div class="transaction-row">
      <div class="transaction-left-column"><p>{{ $t("transactions.total") }}</p></div>
      <div class="transaction-right-column"><p>{{ formatValueEuro(invoiceInfo.amount) }}</p></div>
    </div>
    <div v-if="invoiceInfo.invoice?.to" class="transaction-row">
      <div class="transaction-left-column"><p>{{ $t("transactions.to") }}</p></div>
      <div class="transaction-right-column">
        <p>
          {{ invoiceInfo.invoice?.to.firstName + ' ' + invoiceInfo.invoice?.to.lastName }}
        </p>
      </div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>{{ $t("transactions.transferDesc") }}</p></div>
      <div class="transaction-right-column"><p>{{ invoiceInfo.invoice?.description }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>{{ $t("transactions.transferStatus") }}</p></div>
      <div class="transaction-right-column"><p>{{ invoiceInfo.invoice?.currentState.state }}</p></div>
    </div>
    <div class="transaction-row">
      <div class="transaction-left-column"><p>{{ $t("transactions.transferType") }}</p></div>
      <div class="transaction-right-column"><p>{{ $t("transactions.invoice") }}</p></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../styles/Modal.css';
</style>
