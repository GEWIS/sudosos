<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ t('home.Overview') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-column flex-column">
      <UserInfo :user="gewisUser || authStore.user as GewisUserResponse" class="md:hidden"/>
      <BalanceWithTopupComponent />
      <CardComponent
          :header="t('transactions.recentTransactions')"
          class="w-full"
          :action="t('c_recentTransactionsTable.all transactions')"
          routerLink="transaction-view">
        <MutationsBalanceCard
          :getMutations="getUserMutations"
          :header="t('c_recentTransactionsTable.recent transactions')"

          :paginator="false"
          :modal="false"

          :rows-amount=6
        />
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import BalanceWithTopupComponent from '@/modules/user/components/balance/BalanceWithTopup.vue';
import MutationsBalanceCard from '@/components/mutations/MutationsBalance.vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';
import type {GewisUserResponse, PaginatedFinancialMutationResponse} from "@sudosos/sudosos-client";
import router from "@/router";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import CardComponent from "@/components/CardComponent.vue";
import {onMounted, ref, type Ref} from "vue";
import UserInfo from "@/modules/user/components/UserInfo.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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

const gewisUser: Ref<GewisUserResponse | undefined> = ref(undefined);
onMounted(async () => {

  await apiService.user.getIndividualUser(authStore.getUser?.id!).then((res) => {
    gewisUser.value = res.data;
  });
});

</script>

<style scoped lang="scss">
.balance-component {
  margin-right: 15px;
}
</style>
