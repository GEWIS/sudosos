<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_currentBalance.balance') }}</div>
    <TopupModal v-model:visible="visible" :amount="amountValue"/>
    <div class="content-wrapper">
      <CardComponent
          :header="$t('balance.Increase balance')"
          class="increase-balance-card"
      >
        <div id="balance-increase-form">
          <p id="balance-increase-title">{{ $t('balance.Balance increase amount') }}</p>
          <div class="p-inputgroup flex-1">
            <InputNumber
              class="cashInput"
              v-model="amountValue"
              :placeholder="$t('balance.Price')"
              inputId="amount"
              mode="currency"
              currency="EUR"
              locale="nl-NL"
              :min="10"
            />
          </div>
        </div>
        <br />
        <Button severity="danger" @click="showDialog">{{ $t('balance.Start payment') }}</Button>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Create Modal for Topping up Balance
// See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/46
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
  min-width: 120px;
}
</style>
