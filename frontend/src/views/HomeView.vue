<template>
  <div class="page-container">
    <div class="page-title">{{ $t('home.Overview') }}</div>
    <div class="content-wrapper">
      <BalanceComponent class="balance-component" :showOption="true"/>
      <MutationsTableComponent v-if="doneLoading"
          class="transactions-table"
          :header="$t('c_recentTransactionsTable.recent transactions')"
          :action="$t('c_recentTransactionsTable.all transactions')"
          :paginatedMutationResponse="financialMutationsResponse"
          :paginator="false"
          :modals="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BalanceComponent from "@/components/BalanceComponent.vue";
import MutationsTableComponent from "@/components/Mutations/MutationsTableComponent.vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import { onMounted, ref } from "vue";
import type { PaginatedFinancialMutationResponse } from "@sudosos/sudosos-client";

const financialMutationsResponse = ref<PaginatedFinancialMutationResponse>({
  '_pagination': {},
  'records': [],
});

const authStore = useAuthStore();
const userStore = useUserStore();
const doneLoading = ref<boolean>(false);


onMounted(async () => {
  await userStore.fetchUsersFinancialMutations(authStore.getUser.id, apiService, 5);
  financialMutationsResponse.value = userStore.getCurrentUser.financialMutations;
  doneLoading.value = true;
});


</script>

<style scoped lang="scss">
@import "../styles/BasePage.css";

.balance-component {
  margin-right: 15px;
}

.transactions-table {
  margin-left: 15px;
}
</style>
