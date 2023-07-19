<template>
  <div class="page-container">
    <div class="page-title">Balance</div>
    <div class="content-wrapper">
      <CardComponent action="start payment" header="increase saldo" class="increase-saldo-card">
        <p id="cash-notice">It is no longer possible to increase your balance in cash during the 'borrel'</p>
        <div id="balance-increase-form">
          <p id="balance-increase-title">Balance increase amount:</p>
        </div>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">

import CardComponent from "@/components/CardComponent.vue";
</script>

<style scoped>
@import "../styles/BasePage.css";

:deep(.p-panel-content) {
  padding-left: 1.25rem!important;
}

#balance-increase-title {
  font-weight: 700;
}
</style>
