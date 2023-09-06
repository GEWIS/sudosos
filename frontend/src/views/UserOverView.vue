<template>
  <div class="page-container">
    <div class="page-title">User Overview</div>
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
      @sort="onSort($event)"
      @filter="onFilter($event)"
    >
      <template #header>
        <div class="usertable-header">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Search" />
          </span>
          <span>
            <Button severity="danger" @click="visible = true">Create</Button>
          </span>
        </div>
      </template>
      <!--      TODO: Change this to gewisId, is id for testing purposes-->
      <Column field="id" header="GEWIS ID" />
      <Column field="firstName" header="First Name" />
      <Column field="lastName" header="Last Name" />
      <Column field="type" header="Type" :showFilterMatchModes="false">
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="userTypes"
            placeholder="Select Type"
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
    <Dialog v-model:visible="visible" modal header="Create User" :style="{ width: '50vw' }">
      <form @submit="handleCreateUser">
        <div class="form-row">
          <label for="first-name">First Name</label>
          <InputText v-model="firstName" id="first-name" />
        </div>
        <div class="form-row">
          <label for="last-name">Last Name</label>
          <InputText v-model="lastName" id="last-name" />
        </div>
        <div class="form-row">
          <label for="user-type">User Type</label>
          <Dropdown
            v-model="userType"
            :options="userTypes"
            placeholder="Select User Type"
            id="user-type"
          />
        </div>
        <div class="form-row">
          <label for="email">Email</label>
          <InputText v-model="email" id="email" />
        </div>
        <div class="form-row" id="actions">
          <Button severity="danger" outlined @click="visible = false">Cancel</Button>
          <Button severity="danger" type="submit">Save</Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@sudosos/sudosos-frontend-common'
import {onMounted, ref, Ref, watch} from 'vue'
import apiService from '@/services/ApiService'
import type { UserResponse } from '@sudosos/sudosos-client'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterMatchMode } from 'primevue/api'
import { debounce } from 'lodash'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import router from '@/router'

const userStore = useUserStore()
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
  firstName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  lastName: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const firstName = ref('')
const lastName = ref('')
const userType = ref('')
const email = ref('')
const visible: Ref<boolean> = ref(false)
const loading = ref(false)
const totalRecords = ref(0)
const allUsers: Ref<UserResponse[]> = ref([])
const userTypes = [
  'MEMBER',
  'ORGAN',
  'BORRELKAART',
  'LOCAL_USER',
  'LOCAL_ADMIN',
  'INVOICE',
  'AUTOMATIC_INVOICE'
]

const delayedAPICall = async (skip: number) => {
  let res = await apiService.user.getAllUsers(Number.MAX_SAFE_INTEGER, skip, filters.value.global.value, true)
  totalRecords.value = res.data._pagination.count;
  allUsers.value = res.data.records
}

const onPage = (event: any) => {
  console.log(event.originalEvent.first);
  delayedAPICall(event.originalEvent.first);
}
// TODO: Fix sorting
const onSort = (event) => {
  console.log(event);
  delayedAPICall(0)
}
//TODO: Fix user type filtering
const onFilter = (event) => {
  console.log(event);
  delayedAPICall(0)
}

watch(filters.value.global, () => {
  delayedAPICall(0);
});

onMounted(async () => {
  console.log('mounted')
  await delayedAPICall();
})

const handleCreateUser = () => {}

async function handleInfoPush(userId: number) {
  console.log(allUsers.value.find(record => record.id == userId));
  const clickedUser: UserResponse | undefined = allUsers.value.find(record => record.id == userId);
  if (clickedUser) userStore.addUser(clickedUser);
  router.push({ name: 'user', params: { userId } })
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

#actions {
  justify-content: flex-end;

  .p-button {
    margin: 0 0.2rem;
  }
}
</style>
