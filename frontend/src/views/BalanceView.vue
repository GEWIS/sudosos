<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_currentBalance.balance') }}</div>
    <TopupModal v-model:visible="visible" :amount="amountValue" />
    <div class="content-wrapper">
      <CardComponent :header="$t('balance.Increase balance')" :func="showDialog">
        <div>
          <p class="font-bold">{{ $t('balance.Balance increase amount') }}</p>
          <div class="w-3 flex-1">
            <InputNumber v-model="amountValue" :placeholder="$t('balance.Price')" inputId="amount" mode="currency"
              currency="EUR" locale="nl-NL" :min="10" />
          </div>
        </div>
        <br />
        <div class="flex justify-content-end">
          <Button @click="showDialog">
            {{ $t('balance.Start payment') }}
          </Button>
        </div>
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
</style>
