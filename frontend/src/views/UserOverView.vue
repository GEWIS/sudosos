<template>
  <div class="page-container">
    <div class="page-title">{{ $t('app.User overview') }}</div>
    <DataTable
      v-model:filters="filters"
      :value="allUsers"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 25, 50, 100]"
      filterDisplay="menu"
      :globalFilterFields="['type', 'firstName', 'lastName', 'fullName']"
      lazy
      :totalRecords="totalRecords"
      :loading="loading"
      @page="onPage($event)"
      @sort="onSort()"
      @filter="onFilter()"
    >
      <template #header>
        <div class="usertable-header">
          <span class="p-input-icon-left search-box">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" :placeholder="$t('app.Search')" />
          </span>
          <span>
            <Button severity="danger" @click="visible = true">{{ $t('app.Create') }}</Button>
          </span>
        </div>
      </template>
      <!--      TODO: Change this to gewisId, is id for testing purposes-->
      <Column field="id" header="GEWIS ID" />
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
      <Column
        headerStyle="width: 3rem; text-align: center"
        bodyStyle="text-align: center; overflow: visible"
      >
        <template #body="slotProps">
          <Button
            @click="handleInfoPush(slotProps.data.id)"
            type="button"
            severity="danger"
            icon="pi pi-info-circle"
            outlined
          />
        </template>
      </Column>
    </DataTable>
    <Dialog
        v-model:visible="visible"
        modal
        :header="$t('c_userTable.Create User')"
        :style="{ width: '50vw' }"
        @after-hide="resetForm"
    >
      <form @submit="handleCreateUser">
        <div class="form-row">
          <label for="first-name">{{ $t('c_userTable.firstName') }}</label>
          <div class="input-container">
            <InputText v-bind="firstName" id="first-name" />
            <span class="error-text">{{ errors.firstName }}</span>
          </div>
        </div>
        <div class="form-row">
          <label for="last-name">{{ $t('c_userTable.lastName') }}</label>
          <div class="input-container">
            <InputText v-bind="lastName" id="last-name"/>
            <span class="error-text">{{ errors.lastName }}</span></div>
        </div>
        <div class="form-row">
          <label for="user-type">{{ $t('c_userTable.User Type') }}</label>
          <div class="input-container">
            <Dropdown
                v-bind="userType"
                :options="userTypes"
                :placeholder="$t('c_userTable.Select User Type')"
                id="user-type"
            />
            <span class="error-text">{{ errors.userType }}</span></div>
        </div>
        <div class="form-row">
          <label for="email">{{ $t('profile.Email address') }}</label>
          <div class="input-container">
            <InputText v-bind="email" id="email"/>
            <span class="error-text">{{ errors.email }}</span></div>
        </div>
        <div class="form-row" id="actions">
          <Button severity="danger" outlined @click="visible = false">{{ $t('c_confirmationModal.Cancel' )}}</Button>
          <Button type="submit" severity="danger" >{{ $t('c_confirmationModal.Save' )}}</Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import apiService from '@/services/ApiService';
import type { CreateUserRequest, UserResponse } from '@sudosos/sudosos-client';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from 'primevue/api';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import router from '@/router';
import { userDetailsSchema } from "@/utils/validation-schema";
import { useForm } from "vee-validate";

const userStore = useUserStore();

const { defineComponentBinds, handleSubmit, errors, resetForm } = useForm({
  validationSchema: userDetailsSchema,
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
  firstName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  lastName: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const firstName = defineComponentBinds('firstName');
const lastName = defineComponentBinds('lastName');
const userType = defineComponentBinds('userType');
const email = defineComponentBinds('email');

const visible: Ref<boolean> = ref(false);
const loading = ref(false);
const totalRecords = ref(0);
const allUsers: Ref<UserResponse[]> = ref([]);

const userTypes = [
  'MEMBER',
  'ORGAN',
  'BORRELKAART',
  'LOCAL_USER',
  'LOCAL_ADMIN',
  'INVOICE',
  'AUTOMATIC_INVOICE'
];

onMounted(async () => {
  await delayedAPICall(0);
});

const delayedAPICall = async (skip: number) => {
  let res = await apiService.user.getAllUsers(
    Number.MAX_SAFE_INTEGER,
    skip,
    filters.value.global.value || '',
    true,
      undefined,
      undefined,
      filters.value.type.value,
  );
  totalRecords.value = res.data._pagination.count || 0;
  allUsers.value = res.data.records;
};

const onPage = (event: any) => {
  delayedAPICall(event.originalEvent.first);
};
// TODO: Fix sorting

const onSort = () => {
  delayedAPICall(0);
};
//TODO: Fix user type filtering
const onFilter = () => {
  delayedAPICall(0);
};

watch(filters.value.global, () => {
  delayedAPICall(0);
});

const handleCreateUser = handleSubmit(async (values) => {
  console.log(true);
  const createUserRequest: CreateUserRequest = {
    firstName: values.firstName,
    lastName: values.lastName,
    active: true,
    type: userTypes.indexOf(values.userType),
    email: values.email || '',
  };
  const response = await apiService.user.createUser(createUserRequest);
  if (response.status === 200) {
    await router.push({ name: 'user-overview' });
  } else {
    console.error(response.status + ": " + response.statusText);
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
</script>

<style scoped>
@import '../styles/BasePage.css';

/* Style for the DataTable header */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f8f8;
  border-top: none;
  text-transform: uppercase;
  font-family: Lato, Arial, sans-serif !important;
  font-size: 1rem;
  padding: 0.375rem 0;
  line-height: 1.5;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

/* Style for the DataTable body */
:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: #f8f8f8;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  font-family: Lato, Arial, sans-serif !important;
}

/* Style for the DataTable wrapper */
:deep(.p-datatable > .p-datatable-wrapper > .p-datatable-table) {
  background-color: #f8f8f8;
  border-top: none;
  border-left: 1px solid #d9d9d9;
  border-right: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  padding-left: 1rem;
  padding-right: 1rem;
}

:deep(.p-datatable > .p-datatable-header) {
  border-width: 1px 1px 0 1px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.usertable-header {
  display: flex;
  justify-content: space-between;
}

form {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-row label {
  font-weight: 600;
  margin-right: 1rem; /* Add space to the right of the label */
  min-width: 150px; /* Adjust the width of the label column */
}

.input-container {
  display: flex;
  flex-direction: column;
}

.error-text {
  color: red; /* Set the error text color to red */
  margin-top: 4px; /* Add some space between the input and the error text */
}

#actions {
  justify-content: flex-end;

  .p-button {
    margin: 0 0.2rem;
  }
}

i {
  margin-top: -0.5rem!important;
}

</style>
