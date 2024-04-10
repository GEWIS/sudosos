<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_currentBalance.balance') }}</div>
    <TopupModal v-model:visible="visible" :amount="amountValue" />
    <div class="content-wrapper">
      <CardComponent :header="$t('balance.Increase balance')" :func="showDialog">
        <div>
          <p class="font-bold">{{ $t('balance.Balance increase amount') }}</p>
          <div class="w-3 flex-1">
            <InputNumber
              v-model="amountValue"
              :placeholder="$t('balance.Price')"
              inputId="amount"
              mode="currency"
              currency="EUR"
              locale="nl-NL"
            />
          </div>
          <p v-if="!isUndefined(amountValue) && amountValue < 10 && amountValue != -1 * userBalance" class="font-bold text-red-500">
            {{ $t('balance.minPayment') }}
          </p>
          <br v-else />
        </div>
        <br />
        <div class="flex justify-content-end">
        <Button
          @click="showDialog"
          :disabled="isUndefined(amountValue) || amountValue < 10 && amountValue != -1 * userBalance"
        >
          {{ $t('balance.Start payment') }}
        </Button>
        </div>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { onMounted, ref } from "vue";
import TopupModal from "@/components/TopupModalComponent.vue";
import { isUndefined } from "lodash";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import router from "@/router";
import apiService from "@/services/ApiService";

// Define the 'visible' ref variable to control dialog visibility
const visible = ref(false);
const amountValue = ref(0);

// Function to set 'visible' to true, showing the dialog
const showDialog = () => {
  visible.value = true;
};

const userBalance = ref();

const userStore = useUserStore();

onMounted(async () => {
  if (!userStore.getCurrentUser.user){
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchCurrentUserBalance(userStore.getCurrentUser.user.id, apiService);
  if (!userStore.getCurrentUser.balance?.amount) {
    await router.replace({ path: '/error' });
    return;
  }
  userBalance.value = userStore.getCurrentUser.balance.amount.amount / 100;
  console.warn(userBalance.value);
});
</script>

<style scoped>
</style>
