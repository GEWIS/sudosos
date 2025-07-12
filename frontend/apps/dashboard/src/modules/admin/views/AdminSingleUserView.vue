<template>
  <PageContainer>
    <div v-if="currentUser">
      <div class="text-4xl mb-4">
        {{ t('modules.admin.singleUser.profile', { user: firstName, gewisId }) }}
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
            @update-mutations="() => mutations?.refresh()"
          />
        </div>

        <CardComponent class="w-full" :header="t('components.mutations.user')">
          <MutationsBalance ref="mutations" :get-mutations="getUserMutations" modal paginator />
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
import { computed, onBeforeMount, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import type { GewisUserResponse, PaginatedFinancialMutationResponse, UserResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import AdminUserBalance from '@/modules/admin/components/users/AdminUserBalance.vue';
import apiService from '@/services/ApiService';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import MutationsBalance from '@/components/mutations/MutationsBalance.vue';
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
const mutations: Ref<InstanceType<typeof MutationsBalance> | null> = ref(null);

// Computed properties
const firstName = computed(() => currentUser.value?.firstName || '');

const isMember = computed(() => !!currentUser.value && currentUser.value.type === String(USER_TYPES.MEMBER));

const memberUser = computed(() => (isMember.value ? (currentUser.value as GewisUserResponse) : null));

const gewisId = computed(() => (memberUser.value?.gewisId ? `(m${memberUser.value.gewisId})` : ''));

// Fetch user
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
  if (mutations.value) await mutations.value.refresh();
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
</script>
