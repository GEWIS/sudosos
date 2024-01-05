<template>
  <div class="page-container">
    <div class="page-title">{{ $t('app.User overview') }}</div>
    <CardComponent :header="$t('app.User overview')" class="full-width">
    <DataTable
      v-model:filters="filters"
      :value="sortedUsers.length > 0 ? sortedUsers : allUsersWithFullName"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 25, 50, 100]"
      filterDisplay="menu"
      :globalFilterFields="['type', 'firstName', 'lastName', 'fullName']"
      lazy
      :totalRecords="sortedUsers.length > 0 ? sortedUsers.length : totalRecords"
      :loading="loading"
      @page="onPage($event)"
      @sort="onSort()"
      @filter="onFilter()"
    >
      <template #header>
        <div class="flex flex-row gap-2">
              <span class="p-input-icon-left search-box">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" :placeholder="$t('app.Search')" />
              </span>
          <span>
                <Button @click="visible = true">{{ $t('app.Create') }}</Button>
              </span>
        </div>
      </template>
      <Column field="gewisId" header="GEWIS ID" />
      <Column field="firstName" :header="$t('c_userTable.firstName')" />
      <Column field="lastName" :header="$t('c_userTable.lastName')" />
      <Column field="type" :header="$t('c_userTable.Type')" :showFilterMatchModes="false">
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="userTypes"
            :placeholder="$t('c_userTable.Select Type')"
          />
        </template>
      </Column>
      <Column field="active" :showFilterMatchModes="false">
        <template #header>
          <div class="flex flex-row gap-2 align-items-center">
            {{ $t("userDetails.Active") }}
            <Checkbox
              v-model="isActiveFilter"
              @change="onFilter()"
              binary
            />
          </div>
        </template>
      </Column>

      <Column field="ofAge">
        <template #header>
          <div class="flex flex-row gap-2 align-items-center">
            {{ $t('c_userTable.ofAge') }}
            <Checkbox
              v-model="ofAgeFilter"
              @change="onFilter()"
              binary
            />
          </div>
        </template>
      </Column>
      <Column
        headerStyle="width: 3rem; text-align: center"
        bodyStyle="text-align: center; overflow: visible"
      >
        <template #body="slotProps">
          <Button
            @click="handleInfoPush(slotProps.data.id)"
            type="button"
            icon="pi pi-info-circle"
            outlined
          />
        </template>
      </Column>
    </DataTable>
    <Dialog
      class="w-auto flex w-9"
      v-model:visible="visible"
      modal
      :header="$t('c_userTable.Create User')"
      @after-hide="resetForm"
    >
      <form @submit="handleCreateUser">
        <div class="field grid">
          <label for="first-name" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('c_userTable.firstName') }}</label>
          <div class="col-12 md:col-10">
            <InputText v-bind="firstName" id="first-name" />
            <span class="error-text">{{ errors.firstName }}</span>
          </div>
        </div>
        <div class="field grid">
          <label for="last-name" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('c_userTable.lastName') }}</label>
          <div class="col-12 md:col-10">
            <InputText v-bind="lastName" id="last-name"/>
            <span class="error-text">{{ errors.lastName }}</span></div>
        </div>
        <div class="field grid">
          <label for="user-type" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('c_userTable.User Type') }}</label>
          <div class="col-12 md:col-10">
            <Dropdown
              v-bind="userType"
              :options="userTypes"
              :placeholder="$t('c_userTable.Select User Type')"
              id="user-type"
            />
            <span class="error-text">{{ errors.userType }}</span></div>
        </div>
        <div class="field grid">
          <label for="email" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('profile.emailAddress') }}</label>
          <div class="col-12 md:col-10">
            <InputText v-bind="email" id="email"/>
            <span class="error-text">{{ errors.email }}</span></div>
        </div>
        <div class="field grid">
          <label for="ofAge" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('profile.ofAge') }}</label>
          <div class="col-12 md:col-10">
            <Checkbox v-bind="ofAge" id="ofAge"/>
            <span class="error-text">{{ errors.ofAge }}</span></div>
        </div>
        <div class="field grid">
          <label for="canGoIntoDebt" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('profile.canGoIntoDebt') }}</label>
          <div class="col-12 md:col-10">
            <Checkbox v-bind="canGoIntoDebt" id="canGoIntoDebt"/>
            <span class="error-text">{{ errors.canGoIntoDebt }}</span></div>
        </div>
        <div class="form-row" id="actions">
          <Button outlined @click="visible = false">{{ $t('c_confirmationModal.Cancel' )}}</Button>
          <Button type="submit">{{ $t('c_confirmationModal.Save' )}}</Button>
        </div>
      </form>
    </Dialog>
    </CardComponent>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { computed, onMounted, ref, type Ref, watch } from "vue";
import apiService from '@/services/ApiService';
import type { CreateUserRequest, GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from 'primevue/api';
import Checkbox from "primevue/checkbox";
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import router from '@/router';
import { userDetailsSchema } from '@/utils/validation-schema';
import { useForm } from 'vee-validate';
import Fuse from 'fuse.js';
import CardComponent from '@/components/CardComponent.vue';

const userStore = useUserStore();
const searchQuery: Ref<string> = ref('');
const { defineComponentBinds, handleSubmit, errors, resetForm } = useForm({
  validationSchema: userDetailsSchema,
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const firstName = defineComponentBinds('firstName');
const lastName = defineComponentBinds('lastName');
const userType = defineComponentBinds('userType');
const email = defineComponentBinds('email');
const ofAge = defineComponentBinds('ofAge');
const canGoIntoDebt = defineComponentBinds('canGoIntoDebt');


const isActiveFilter: Ref<boolean> = ref(true);
const ofAgeFilter: Ref<boolean> = ref(true);
const visible: Ref<boolean> = ref(false);
const loading = ref(false);
const totalRecords = ref(0);
const allUsers: Ref<GewisUserResponse[]> = ref([]);
const allUsersWithFullName: Ref<GewisUserResponse[]> = computed(() => {
  return allUsers.value.map((user) => {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    };
  });
});

const userTypes = [
  'MEMBER',
  'ORGAN',
  'VOUCHER',
  'LOCAL_USER',
  'LOCAL_ADMIN',
  'INVOICE',
  'AUTOMATIC_INVOICE'
];

onMounted(() => {
  delayedAPICall(0);

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

const handleCreateUser = handleSubmit(async (values) => {
  const createUserRequest: CreateUserRequest = {
    firstName: values.firstName,
    lastName: values.lastName,
    type: userTypes.indexOf(values.userType),
    email: values.email || '',
    ofAge: values.ofAge,
    canGoIntoDebt: values.canGoIntoDebt,
  };
  const response = await apiService.user.createUser(createUserRequest);
  if (response.status === 200) {
    await router.push({ name: 'user-overview' });
  } else {
    console.error(response.status + ': ' + response.statusText);
  }
  visible.value = false;
});

async function handleInfoPush(userId: number) {
  const clickedUser: UserResponse | undefined = allUsers.value.find(
    (record) => record.id == userId
  );
  if (clickedUser) userStore.addUser(clickedUser);
  router.push({ name: 'user', params: { userId } });
}

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
</script>

<style scoped>
</style>
