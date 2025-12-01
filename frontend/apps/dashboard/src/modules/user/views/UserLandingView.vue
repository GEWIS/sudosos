<template>
  <PageContainer>
    <div class="text-4xl mb-4">{{ t('modules.user.landing.welcome') + userFirstName }}</div>
    <div class="flex flex-col gap-5">
      <UserInfo class="md:hidden" :user="user" />
      <BalanceWithTopupComponent />
      <CardComponent
        :action="t('components.mutations.all')"
        class="w-full"
        :header="t('components.mutations.recent')"
        router-link="transactions"
      >
        <MutationsBalance :get-mutations="getUserMutations" :paginator="false" preload :rows-amount="6" />
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import type { PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import BalanceWithTopupComponent from '@/modules/user/components/balance/BalanceWithTopup.vue';
import apiService from '@/services/ApiService';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import UserInfo from '@/modules/user/components/UserInfo.vue';
import CardComponent from '@/components/CardComponent.vue';
import MutationsBalance from '@/components/mutations/MutationsBalance.vue';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const { user } = storeToRefs(authStore);

const userFirstName = computed(() => {
  return user.value?.firstName;
});

const getUserMutations = async (
  take: number,
  skip: number,
): Promise<PaginatedFinancialMutationResponse | undefined> => {
  if (!user.value) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore
    .fetchUsersFinancialMutations(user.value.id, apiService, take, skip)
    .catch((err) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};
</script>

<style scoped lang="scss">
.balance-component {
  margin-right: 15px;
}
</style>
