<template>
  <div class="page-container">
    <div class="page-title">{{ $t('transactions.Transactions') }}</div>
    <div class="content-wrapper">
      <MutationsTableComponent
        v-if="doneLoading"
        class="transactions-table"
        :header="$t('c_recentTransactionsTable.recent transactions')"
        :paginatedMutationResponse="financialMutationsResponse"
        :modal="true"
        :paginator="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MutationsTableComponent from '@/components/Mutations/MutationsTableComponent.vue';
import apiService from '@/services/ApiService';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { onMounted, ref } from 'vue';
import type { PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { handleError } from '@/utils/errorUtils';
import router from '@/router';
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const financialMutationsResponse = ref<PaginatedFinancialMutationResponse>({
  _pagination: {},
  records: []
});

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();
const doneLoading = ref<boolean>(false);

onMounted(async () => {
  if (!authStore.getUser) {
    router.replace({ path: '/error' });
    return;
  }
  await userStore
    .fetchUsersFinancialMutations(authStore.getUser.id, apiService)
    .catch((err) => handleError(err, toast));
  financialMutationsResponse.value = userStore.getCurrentUser.financialMutations;
  doneLoading.value = true;
});
</script>

<style scoped lang="scss">
@import '../styles/BasePage.css';
</style>
