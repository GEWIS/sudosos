<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_currentSaldo.saldo') }}</div>
    <TopupModal v-model:visible="visible" :amount="amountValue"/>
    <div class="content-wrapper">
      <CardComponent
          :action="$t('c_currentSaldo.startPayment')"
          :header="$t('c_currentSaldo.Increase Saldo')"
          class="increase-saldo-card"
          :func="showDialog"
      >
        <p id="cash-notice">{{ $t('c_currentSaldo.cashtopup') }}</p>
        <div id="balance-increase-form">
          <p id="balance-increase-title">{{ $t('c_currentSaldo.increase') }}</p>
          <div class="p-inputgroup flex-1">
            <span class="p-inputgroup-addon">{{ $t('c_currentSaldo.currency') }}</span>
            <InputNumber v-model="amountValue" :placeholder="$t('c_productInfoModal.Price')" inputId="amount"/>
          </div>
        </div>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Create Modal for Topping up Balance
import CardComponent from "@/components/CardComponent.vue";
import { ref } from "vue";
import TopupModal from "@/components/TopupModalComponent.vue";



// Define the 'visible' ref variable to control dialog visibility
const visible = ref(false);
const amountValue = ref();

// Function to set 'visible' to true, showing the dialog
const showDialog = () => {
  visible.value = true;

};
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
