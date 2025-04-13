<template>
  <div class="page-container">
    <div class="page-title">
      {{ t('modules.admin.singleUser.profile', { user: currentUser ? currentUser.firstName : '' }) }}
    </div>
    <div class="flex flex-column gap-5">
      <div class="flex flex-column gap-8 justify-content-between md:flex-row">
        <AdminUserInfoCard v-if="currentUser" class="flex-grow-1" :user="currentUser" />
        <AdminUserBalance v-if="currentUser" :user="currentUser" @update-mutations="() => mutations?.refresh()" />
      </div>
      <MutationsBalanceCard
        ref="mutations"
        class="w-full"
        :get-mutations="getUserMutations"
        :header="t('components.mutations.user')"
        modal
        paginator
        :simple="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import type { PaginatedFinancialMutationResponse, UserResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import AdminUserBalance from '@/modules/admin/components/users/AdminUserBalance.vue';
import apiService from '@/services/ApiService';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import MutationsBalanceCard from '@/components/mutations/MutationsBalance.vue';
import AdminUserInfoCard from '@/modules/admin/components/users/AdminUserInfoCard.vue';

const { t } = useI18n();

const route = useRoute();
const userStore = useUserStore();
const toast = useToast();
const currentUser: Ref<UserResponse> = ref<UserResponse>(null!);
// TODO: Fix this somehow?
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const mutations: Ref<InstanceType<typeof MutationsBalanceCard> | null> = ref(null);

const getUser = async () => {
  await apiService.user
    .getIndividualUser(Number(route.params.userId))
    .then((res) => {
      currentUser.value = res.data;
    })
    .catch((error: AxiosError) => {
      handleError(error, toast);
    });
  if (!currentUser.value) {
    await router.replace({ path: '/error' });
    return;
  }
  if (mutations?.value) await mutations.value.refresh();
};

watch(
  () => route.params.userId,
  async () => {
    await getUser();
  },
);

onBeforeMount(async () => {
  await getUser();
});

const getUserMutations = async (
  take: number,
  skip: number,
): Promise<PaginatedFinancialMutationResponse | undefined> => {
  await userStore
    .fetchUsersFinancialMutations(Number(route.params.userId), apiService, take, skip)
    .catch((err: AxiosError) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};
</script>

<style scoped lang="scss"></style>
