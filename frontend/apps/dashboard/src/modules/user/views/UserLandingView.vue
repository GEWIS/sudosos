<template>
  <div class="flex flex-column page-container">
    <div class="page-title">{{ t('modules.user.landing.title') }}</div>
    <div class="content-wrapper flex flex-column gap-5 md:flex-column">
      <UserInfo class="md:hidden" :user="gewisUser || (authStore.user as GewisUserResponse)" />
      <BalanceWithTopupComponent />
      <MutationsBalanceCard
        :get-mutations="getUserMutations"
        :header="t('components.mutations.recent')"
        :modal="false"
        :paginator="false"
        :rows-amount="6"
        :simple="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import type { GewisUserResponse, PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BalanceWithTopupComponent from '@/modules/user/components/balance/BalanceWithTopup.vue';
import MutationsBalanceCard from '@/components/mutations/MutationsBalance.vue';
import apiService from '@/services/ApiService';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import UserInfo from '@/modules/user/components/UserInfo.vue';

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

const gewisUser: Ref<GewisUserResponse | undefined> = ref(undefined);
onMounted(async () => {
  await apiService.user.getIndividualUser(authStore.getUser!.id).then((res) => {
    gewisUser.value = res.data;
  });
});
</script>

<style scoped lang="scss">
.balance-component {
  margin-right: 15px;
}
</style>
