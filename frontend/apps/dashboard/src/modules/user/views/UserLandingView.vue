<template>
  <PageContainer>
    <div class="text-4xl mb-4">{{ t('modules.user.landing.welcome') + userFirstName }}</div>
    <div class="flex flex-col gap-5">
      <UserInfo class="md:hidden" :user="gewisUser || (authStore.user as GewisUserResponse)" />
      <BalanceWithTopupComponent />
      <CardComponent
        :action="t('components.mutations.all')"
        class="w-full"
        :header="t('components.mutations.recent')"
        router-link="transactions"
      >
        <MutationsBalance :get-mutations="getUserMutations" :paginator="false" :rows-amount="6" />
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import type { GewisUserResponse, PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
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

const userFirstName = computed(() => {
  return authStore.getUser?.firstName;
});

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
