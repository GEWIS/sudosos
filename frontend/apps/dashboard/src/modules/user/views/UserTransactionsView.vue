<template>
  <div class="page-container">
    <div class="page-title">{{ $t('transactions.Transactions') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-column flex-column">
      <MutationsUserTabs
        class="transactions-table"
        :get-balance-mutations="getUserMutations"
        :get-seller-mutations="getTransactionsForOthers"
        :paginator="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MutationsUserTabs from '@/components/mutations/MutationsUserTabs.vue';
import apiService from '@/services/ApiService';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import type { PaginatedBaseTransactionResponse, PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { handleError } from '@/utils/errorUtils';
import router from '@/router';
import { useI18n } from "vue-i18n";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { t, locale } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const getUserMutations = async (take: number, skip: number)
  : Promise<PaginatedFinancialMutationResponse | undefined> => {
  if (!authStore.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchUsersFinancialMutations(authStore.getUser.id, apiService, take, skip)
    .catch((err) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};

const getTransactionsForOthers = async (take: number, skip: number)
  : Promise<PaginatedBaseTransactionResponse | undefined> => {
  if (!authStore.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchUserCreatedTransactions(authStore.getUser.id, apiService, take, skip)
    .catch((err) => handleError(err, toast));
  return userStore.getCurrentUser.createdTransactions;
};
</script>

<style scoped lang="scss">
</style>
