<template>
  <div class="page-container">
    <div class="page-title">Balance</div>
    <div class="content-wrapper">
      <CardComponent action="start payment" header="increase saldo" class="increase-saldo-card">
        <p id="cash-notice">It is no longer possible to increase your balance in cash during the 'borrel'</p>
        <div id="balance-increase-form">
          <p id="balance-increase-title">Balance increase amount:</p>
          <div class="p-inputgroup flex-1">
            <span class="p-inputgroup-addon">€</span>
            <InputNumber placeholder="Price" />
          </div>
        </div>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Create Modal for Topping up Balance

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

.p-inputgroup {
  width: 25%;
}
</style>
