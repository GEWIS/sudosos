<template>
  <PageContainer>
    <div v-if="currentUser">
      <div class="text-4xl mb-4">
        {{ t('modules.admin.singleUser.profile', { user: firstName, memberId }) }}
      </div>
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-8 justify-between md:flex-row">
          <div class="flex flex-col gap-8">
            <AdminUserEditCard :user="currentUser" />
            <AdminUserInfoCard :user="currentUser" />
          </div>
          <AdminUserBalance
            class="flex-grow flex-grow-1 md:flex-grow-0 md:self-start"
            :user="currentUser"
            @update-mutations="
              () => {
                transferMutations?.refresh();
                transactionMutations?.refresh();
              }
            "
          />
        </div>

        <CardComponent class="w-full" :header="t('components.mutations.user')">
          <template v-if="isOrgan">
            <Tabs value="transfers">
              <TabList>
                <Tab value="transfers">{{ t('components.mutations.transfers') }}</Tab>
                <Tab value="transactions">{{ t('components.mutations.transactions') }}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel value="transfers">
                  <MutationsTransfers ref="transferMutations" :get-transfers="getUserTransfers" paginator />
                </TabPanel>
                <TabPanel value="transactions">
                  <MutationsBalance ref="transactionMutations" :get-mutations="getUserTransactionsOnly" paginator />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </template>
          <MutationsBalance v-else ref="transactionMutations" :get-mutations="getUserMutations" paginator />
        </CardComponent>
      </div>
    </div>
    <div v-else>
      <div class="m-auto flex justify-center items-center">
        <ProgressSpinner />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch, watchEffect } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import type {
  PaginatedFinancialMutationResponse,
  PaginatedTransferResponse,
  UserResponse,
} from '@gewis/sudosos-client';
import { FinancialMutationResponseTypeEnum } from '@gewis/sudosos-client';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import AdminUserBalance from '@/modules/admin/components/users/AdminUserBalance.vue';
import apiService from '@/services/ApiService';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import MutationsBalance from '@/components/mutations/MutationsBalance.vue';
import MutationsTransfers from '@/components/mutations/MutationsTransfers.vue';
import AdminUserInfoCard from '@/modules/admin/components/users/AdminUserInfoCard.vue';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';
import AdminUserEditCard from '@/modules/admin/components/users/AdminUserEditCard.vue';
import { USER_TYPES } from '@/utils/validation-schema';

const { t } = useI18n();

const route = useRoute();
const userStore = useUserStore();
const toast = useToast();
const currentUser: Ref<UserResponse | null> = ref(null);
// TODO: Fix this somehow?
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const transferMutations: Ref<InstanceType<typeof MutationsTransfers> | null> = ref(null);
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const transactionMutations: Ref<InstanceType<typeof MutationsBalance> | null> = ref(null);

// Computed properties
const firstName = computed(() => currentUser.value?.firstName || '');

const isMember = computed(() => !!currentUser.value && currentUser.value.type === String(USER_TYPES.MEMBER));
const isOrgan = computed(() => !!currentUser.value && currentUser.value.type === String(USER_TYPES.ORGAN));

const memberUser = computed(() => (isMember.value ? currentUser.value : null));

const memberId = computed(() => (memberUser.value?.memberId ? `(m${memberUser.value.memberId})` : ''));

watchEffect(() => {
  if (currentUser.value) {
    const userName = `${currentUser.value.firstName} ${currentUser.value.lastName}`;
    document.title = `${userName} - ${t('common.titles.users')} | ${t('common.sudosos')}`;
  }
});

// Fetch user
const getUser = async () => {
  await apiService.user
    .getIndividualUser({ id: Number(route.params.userId) })
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
  if (transferMutations.value) await transferMutations.value.refresh();
  if (transactionMutations.value) await transactionMutations.value.refresh();
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

// Get transfers for user
const getUserTransfers = async (take: number, skip: number): Promise<PaginatedTransferResponse | undefined> => {
  const response = await apiService.user
    .getUsersTransfers({ id: Number(route.params.userId), take, skip })
    .catch((err: AxiosError) => handleError(err, toast));
  return response?.data;
};

// Get mutations for user
const getUserMutations = async (
  take: number,
  skip: number,
): Promise<PaginatedFinancialMutationResponse | undefined> => {
  await userStore
    .fetchUsersFinancialMutations(Number(route.params.userId), apiService, take, skip)
    .catch((err: AxiosError) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};

// Get transactions-only for organ users (excludes transfers)
const getUserTransactionsOnly = async (
  take: number,
  skip: number,
): Promise<PaginatedFinancialMutationResponse | undefined> => {
  const response = await apiService.user
    .getUsersTransactions({ id: Number(route.params.userId), take, skip })
    .catch((err: AxiosError) => handleError(err, toast));
  if (!response) return undefined;
  return {
    records: response.data.records.map((t) => ({
      type: FinancialMutationResponseTypeEnum.Transaction,
      mutation: t,
    })),
    _pagination: response.data._pagination,
  };
};
</script>
