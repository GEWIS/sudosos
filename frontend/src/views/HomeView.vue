<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('home.Overview') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-row flex-column">
      <UserInfoComponent :user="userStore.getCurrentUser.user as GewisUserResponse | UserResponse" class="xl:hidden lg:hidden"/>
      <BalanceComponent :showOption="true"/>
      <MutationsTableComponent
          :callback-function="getUserMutations"
          :header="$t('c_recentTransactionsTable.recent transactions')"
          :action="$t('c_recentTransactionsTable.all transactions')"
          :paginator="false"
          :modal="false"
          routerLink="transaction-view"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BalanceComponent from '@/components/BalanceComponent.vue';
import MutationsTableComponent from '@/components/Mutations/MutationsTableComponent.vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';
import type { GewisUserResponse, PaginatedFinancialMutationResponse, UserResponse } from '@sudosos/sudosos-client';
import router from "@/router";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import UserInfoComponent from "@/components/UserInfoComponent.vue";

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const getUserMutations = async (take: number, skip: number):
    Promise<PaginatedFinancialMutationResponse | undefined> => {
  if (!authStore.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchUsersFinancialMutations(authStore.getUser.id, apiService, take, skip)
      .catch((err) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};

</script>

<style scoped lang="scss">
.balance-component {
  margin-right: 15px;
}
</style>
