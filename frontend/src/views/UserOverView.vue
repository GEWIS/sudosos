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
        @sort="onSort"
        @filter="onFilter"
      >
        <template #header>
          <div class="flex flex-row align-items-center justify-content-between">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="searchQuery" placeholder="Search..." />
            </span>
            <Button label="Create" icon="pi pi-plus" @click="visible = true" />
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
      <Dialog v-model:visible="visible" modal header="Create User" :style="{ width: '50vw' }" @hide="resetForm">
        <form @submit.prevent="handleCreateUser" class="p-fluid">
          <div class="field">
            <label for="firstName">First Name</label>
            <InputText id="firstName" v-model="firstName" v-bind="firstNameAttrs" />
            <small class="p-error">{{ errors.firstName }}</small>
          </div>
          <div class="field">
            <label for="lastName">Last Name</label>
            <InputText id="lastName" v-model="lastName" v-bind="lastNameAttrs" />
            <small class="p-error">{{ errors.lastName }}</small>
          </div>
          <div class="field">
            <label for="userType">User Type</label>
            <Dropdown
              id="userType"
              v-model="userType"
              v-bind="userTypeAttrs"
              :options="userTypes"
              optionLabel="name"
              placeholder="Select a type"
              optionValue="value"
            />
            <small class="p-error">{{ errors.userType }}</small>
          </div>
          <div class="field">
            <label for="email">Email</label>
            <InputText id="email" v-model="email" v-bind="emailAttrs" />
            <small class="p-error">{{ errors.email }}</small>
          </div>
          <div class="field">
            <label for="ofAge">Of Age</label>
            <Checkbox id="ofAge" v-model="ofAge" v-bind="ofAgeAttrs" binary />
            <small class="p-error">{{ errors.ofAge }}</small>
          </div>
          <div class="field">
            <label for="canGoIntoDebt">Can Go Into Debt</label>
            <Checkbox id="canGoIntoDebt" v-model="canGoIntoDebt" v-bind="canGoIntoDebtAttrs" binary />
            <small class="p-error">{{ errors.canGoIntoDebt }}</small>
          </div>
          <div class="flex justify-content-end">
            <Button label="Cancel" class="p-button-text" @click="visible = false" />
            <Button label="Save" class="p-button-outlined" type="submit" />
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
import { userDetailsSchema, userTypes } from "@/utils/validation-schema";
import { useForm } from 'vee-validate';
import Fuse from 'fuse.js';
import CardComponent from '@/components/CardComponent.vue';

const userStore = useUserStore();
const searchQuery: Ref<string> = ref('');
const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: userDetailsSchema,
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const [firstName, firstNameAttrs] = defineField('firstName', {});
const [lastName, lastNameAttrs] = defineField('lastName', {});
const [userType, userTypeAttrs] = defineField('userType', {});
const [email, emailAttrs] = defineField('email', {});
const [ofAge, ofAgeAttrs] = defineField('ofAge', {});
const [canGoIntoDebt, canGoIntoDebtAttrs] = defineField('canGoIntoDebt', {});


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
  // Ensure userType is a number. You might need a more complex check depending on your data.
  const userTypeAsNumber = Number(values.userType);

  // Check if conversion was successful or if the value was already a number
  if (isNaN(userTypeAsNumber)) {
    console.error('User type is not a valid number:', values.userType);
    // Handle error appropriately, possibly aborting the submit or setting a default
    return;
  }

  const createUserRequest: CreateUserRequest = {
    firstName: values.firstName,
    lastName: values.lastName,
    type: userTypeAsNumber, // Use the converted/validated number here
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
