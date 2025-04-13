<template>
  <div class="page-container">
    <div class="page-title">{{ t('modules.user.transactions.title') }}</div>
    <div class="content-wrapper flex flex-column gap-5 md:flex-column">
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
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import type { PaginatedBaseTransactionResponse, PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import MutationsUserTabs from '@/components/mutations/MutationsUserTabs.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import router from '@/router';

const { t } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const getUserMutations = async (
  take: number,
  skip: number,
): Promise<PaginatedFinancialMutationResponse | undefined> => {
  if (!authStore.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore
    .fetchUsersFinancialMutations(authStore.getUser.id, apiService, take, skip)
    .catch((err) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};

const getTransactionsForOthers = async (
  take: number,
  skip: number,
): Promise<PaginatedBaseTransactionResponse | undefined> => {
  if (!authStore.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore
    .fetchUserCreatedTransactions(authStore.getUser.id, apiService, take, skip)
    .catch((err) => handleError(err, toast));
  return userStore.getCurrentUser.createdTransactions;
};
</script>

<style scoped lang="scss"></style>
