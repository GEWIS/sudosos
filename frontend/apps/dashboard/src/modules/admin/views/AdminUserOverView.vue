<template>
  <div class="page-container">
    <div class="page-title">{{ t('modules.admin.userOverview.title') }}</div>
    <CardComponent :header="t('modules.admin.userOverview.list.header')" class="full-width">
      <DataTable
        v-model:filters="filters"
        :value="sortedUsers.length > 0 ? sortedUsers : allUsersWithFullName"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        filterDisplay="menu"
        :globalFilterFields="['type', 'firstName', 'lastName', 'fullName']"
        lazy
        :totalRecords="searchQuery.split(' ').length > 1 ? sortedUsers.length : totalRecords"
        :loading="isLoading"
        @page="onPage($event)"
        @sort="onSort"
        @filter="onFilter"
      >
        <template #header>
          <div class="flex flex-row align-items-center justify-content-between">
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search"> </InputIcon>
              <InputText v-model="searchQuery" :placeholder="t('common.search')" />
            </IconField>
            <Button :label="t('common.create')" icon="pi pi-plus" @click="showDialog = true" />
          </div>
        </template>
        <Column field="gewisId" :header="t('common.gewisId')">
          <template #body v-if="isLoading">
            <Skeleton class="w-6 my-1 h-1rem surface-300"/>
          </template>
        </Column>
        <Column field="firstName" :header="t('common.firstName')">
          <template #body v-if="isLoading">
            <Skeleton class="w-8 my-1 h-1rem surface-300"/>
          </template>
        </Column>
        <Column field="lastName" :header="t('common.lastName')">
          <template #body v-if="isLoading">
            <Skeleton class="w-8 my-1 h-1rem surface-300"/>
          </template>
        </Column>
        <Column field="type" :header="t('common.type')" :showFilterMatchModes="false">
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="userTypes"
              optionLabel="name"
              optionValue="name"
              :placeholder="t('common.placeholders.selectType')"
            />
          </template>
          <template #body v-if="isLoading">
            <Skeleton class="w-5 my-1 h-1rem surface-300"/>
          </template>
        </Column>
        <Column field="active" :showFilterMatchModes="false">
          <template #header>
            <div class="flex flex-row gap-2 align-items-center">
              {{ t("common.active") }}
              <Checkbox
                v-model="isActiveFilter"
                @change="onFilter()"
                binary
              />
            </div>
          </template>
          <template #body v-if="isLoading">
            <Skeleton class="w-2 my-1 h-1rem surface-300"/>
          </template>
        </Column>

        <Column field="ofAge">
          <template #header>
            <div class="flex flex-row gap-2 align-items-center">
              {{ t('common.ofAge') }}
              <Checkbox
                v-model="ofAgeFilter"
                @change="onFilter()"
                binary
              />
            </div>
          </template>
          <template #body v-if="isLoading">
            <Skeleton class="w-3 my-1 h-1rem surface-300"/>
          </template>
        </Column>
        <Column
          headerStyle="width: 3rem; text-align: center"
          bodyStyle="text-align: center; overflow: visible"
        >
          <template #body v-if="isLoading">
            <Skeleton class="w-4 my-1 h-1rem surface-300"/>
          </template>
          <template #body="slotProps" v-else>
            <Button
              @click="handleInfoPush(slotProps.data.id)"
              type="button"
              icon="pi pi-info-circle"
              outlined
            />
          </template>

        </Column>
      </DataTable>
    </CardComponent>
    <FormDialog :header="t('modules.admin.forms.user.header')" v-model:modelValue="showDialog"
                :form="form" >
      <template #form="slotProps">
        <UserCreateForm
            :form="slotProps.form"
            v-model:isVisible="showDialog"
            :edit="true"
            @submit:success="showDialog = false"
        />
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref, watch } from "vue";
import apiService from '@/services/ApiService';
import type { GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from 'primevue/api';
import Checkbox from "primevue/checkbox";
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { createUserSchema, userTypes } from "@/utils/validation-schema";
import Fuse from 'fuse.js';
import CardComponent from '@/components/CardComponent.vue';
import Skeleton from "primevue/skeleton";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useI18n } from "vue-i18n";
import FormDialog from "@/components/FormDialog.vue";
import UserCreateForm from "@/modules/admin/components/users/forms/UserCreateForm.vue";
import { schemaToForm } from "@/utils/formUtils";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import router from "@/router";

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
      fullName: `${user.firstName} ${user.lastName}`
    };
  });
});

onMounted(() => {
  isLoading.value = true;
  delayedAPICall(0);
  isLoading.value = false;
});

function debounce(func: (skip: number) => Promise<void>, delay: number): (skip: number) => Promise<void> {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  return async function(...args: [number]) {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const apiCall: (skip: number) => Promise<void> = async (skip: number) => {
  await apiService.user
    .getAllUsers(
      Number.MAX_SAFE_INTEGER,
      skip,
      searchQuery.value.split(' ')[0] || '',
      isActiveFilter.value,
      ofAgeFilter.value,
      undefined,
      filters.value.type.value || undefined
    )
    .then((response) => {
      totalRecords.value = response.data._pagination.count || 0;
      allUsers.value = response.data.records;
    });
};

const delayedAPICall = debounce(apiCall, 250);

const onPage = (event: any) => {
  delayedAPICall(event.originalEvent.first);
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
    threshold: 0.2
  })
    .search(searchQuery.value || '')
    .map((r) => r.item);
  return fuzzed;
});

async function handleInfoPush(userId: number) {
  const clickedUser: UserResponse | undefined = allUsers.value.find(
      (record) => record.id == userId
  );
  if (clickedUser) userStore.addUser(clickedUser);
  router.push({ name: 'user', params: { userId } });
}
</script>

<style scoped>
</style>
