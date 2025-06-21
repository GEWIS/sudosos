<template>
  <PageContainer>
    <CardComponent class="w-full" :header="t('modules.admin.userOverview.list.header')">
      <DataTable
        v-model:filters="filters"
        filter-display="menu"
        :global-filter-fields="['type', 'firstName', 'lastName', 'fullName']"
        lazy
        :loading="isLoading"
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 25, 50, 100]"
        :total-records="searchQuery.split(' ').length > 1 ? sortedUsers.length : totalRecords"
        :value="sortedUsers.length > 0 ? sortedUsers : allUsersWithFullName"
        @filter="onFilter"
        @page="onPage($event)"
        @sort="onSort"
      >
        <template #header>
          <div class="items-center flex flex-row justify-between">
            <IconField icon-position="left">
              <InputIcon class="pi pi-search"> </InputIcon>
              <InputText v-model="searchQuery" :placeholder="t('common.search')" />
            </IconField>
            <Button icon="pi pi-plus" :label="t('common.create')" @click="showDialog = true" />
          </div>
        </template>
        <Column field="gewisId" :header="t('common.gewisId')">
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-6" />
          </template>
        </Column>
        <Column field="firstName" :header="t('common.firstName')">
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-8" />
          </template>
        </Column>
        <Column field="lastName" :header="t('common.lastName')">
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-8" />
          </template>
        </Column>
        <Column field="type" :header="t('common.type')" :show-filter-match-modes="false">
          <template #filter="{ filterModel, filterCallback }">
            <Select
              v-model="filterModel.value"
              option-label="name"
              option-value="name"
              :options="userTypes"
              :placeholder="t('common.placeholders.selectType')"
              @change="filterCallback()"
            />
          </template>
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-5" />
          </template>
        </Column>
        <Column field="active" :show-filter-match-modes="false">
          <template #header>
            <div class="items-center flex flex-row gap-2">
              {{ t('common.active') }}
              <Checkbox v-model="isActiveFilter" binary @change="onFilter()" />
            </div>
          </template>
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-2" />
          </template>
        </Column>

        <Column field="ofAge">
          <template #header>
            <div class="items-center flex flex-row gap-2">
              {{ t('common.ofAge') }}
              <Checkbox v-model="ofAgeFilter" binary @change="onFilter()" />
            </div>
          </template>
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-3" />
          </template>
        </Column>
        <Column body-style="text-align: center; overflow: visible" header-style="width: 3rem; text-align: center">
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-4" />
          </template>
          <template v-else #body="slotProps">
            <Button icon="pi pi-info-circle" outlined type="button" @click="handleInfoPush(slotProps.data.id)" />
          </template>
        </Column>
      </DataTable>
    </CardComponent>
    <FormDialog
      v-model:model-value="showDialog"
      :form="form"
      :header="t('modules.admin.forms.user.header')"
      :is-editable="true"
    >
      <template #form="slotProps">
        <UserCreateForm
          v-model:is-visible="showDialog"
          :edit="true"
          :form="slotProps.form"
          @submit:success="showDialog = false"
        />
      </template>
    </FormDialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref, watch } from 'vue';
import type { GewisUserResponse, UserResponse } from '@sudosos/sudosos-client';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from '@primevue/core/api';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Fuse from 'fuse.js';
import Skeleton from 'primevue/skeleton';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import FormDialog from '@/components/FormDialog.vue';
import UserCreateForm from '@/modules/admin/components/users/forms/UserCreateForm.vue';
import { schemaToForm } from '@/utils/formUtils';
import CardComponent from '@/components/CardComponent.vue';
import { createUserSchema, userTypes } from '@/utils/validation-schema';
import apiService, { DEFAULT_PAGINATION_MAX } from '@/services/ApiService';
import router from '@/router';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();
const userStore = useUserStore();

const searchQuery: Ref<string> = ref('');

const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createUserSchema);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const isActiveFilter: Ref<boolean> = ref(true);
const ofAgeFilter: Ref<boolean> = ref(true);
const isLoading = ref(true);
const totalRecords = ref(0);
const allUsers: Ref<GewisUserResponse[]> = ref(new Array(10));
const allUsersWithFullName: Ref<GewisUserResponse[]> = computed(() => {
  return allUsers.value.map((user) => {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
    };
  });
});

onMounted(() => {
  isLoading.value = true;
  void delayedAPICall(0);
  isLoading.value = false;
});

function debounce(func: (skip: number) => Promise<void>, delay: number): (skip: number) => void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: [number]) {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      void func(...args);
    }, delay);
  };
}

const apiCall: (skip: number) => Promise<void> = async (skip: number) => {
  await apiService.user
    .getAllUsers(
      DEFAULT_PAGINATION_MAX,
      skip,
      searchQuery.value.split(' ')[0] || '',
      isActiveFilter.value ? isActiveFilter.value : undefined,
      ofAgeFilter.value,
      undefined,
      filters.value.type.value || undefined,
    )
    .then((response) => {
      totalRecords.value = response.data._pagination.count || 0;
      allUsers.value = response.data.records;
    });
};

const delayedAPICall = debounce(apiCall, 250);

const onPage = (event: DataTablePageEvent) => {
  delayedAPICall(event.first);
};
// TODO: Fix sorting
// See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/19

const onSort = () => {
  delayedAPICall(0);
};
const onFilter = () => {
  delayedAPICall(0);
};

watch(filters.value.global, () => {
  delayedAPICall(0);
});

watch(searchQuery, () => {
  delayedAPICall(0);
});

const sortedUsers = computed(() => {
  const fuzzed: UserResponse[] = new Fuse(allUsersWithFullName.value, {
    keys: ['fullName'],
    isCaseSensitive: false,
    shouldSort: true,
    threshold: 0.2,
  })
    .search(searchQuery.value || '')
    .map((r) => r.item);
  return fuzzed;
});

function handleInfoPush(userId: number) {
  const clickedUser: UserResponse | undefined = allUsers.value.find((record) => record.id == userId);
  if (clickedUser) userStore.addUser(clickedUser);
  const route = router.resolve({ name: 'user', params: { userId } });
  window.open(route.href, '_blank');
}
</script>

<style scoped></style>
