<script setup lang="ts">
import MutationsTableComponent from "@/components/Mutations/MutationsTableComponent.vue";
import apiService from "@/services/ApiService";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { onMounted, ref } from "vue";
import { PaginatedFinancialMutationResponse } from "@sudosos/sudosos-client";

const financialMutationsResponse = ref<PaginatedFinancialMutationResponse>({
  '_pagination': {},
  'records': [],
});

const authStore = useAuthStore();
const userStore = useUserStore();
const doneLoading = ref<boolean>(false);

async function retrieveAllUserTransactions() {

}

onMounted(async () => {
  await userStore.fetchUsersFinancialMutations(authStore.getUser.id, apiService);
  console.log(userStore.getCurrentUser.financialMutations);
  financialMutationsResponse.value = userStore.getCurrentUser.financialMutations;
  doneLoading.value = true;
});


</script>

<template>
<div class="page-container">
  <div class="page-title">{{ $t('transactions.Transactions') }}</div>
  <div class="content-wrapper">
    <MutationsTableComponent v-if="doneLoading"
                             class="transactions-table"
                             :header="$t('c_recentTransactionsTable.recent transactions')"
                             :Mutations="financialMutationsResponse"
                             :extended="true"
    />
  </div>
</div>
</template>

<style scoped lang="scss">

@import "../styles/BasePage.css";
</style>