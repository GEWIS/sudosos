<template>
  <div class="page-container">
    <div class="page-title">User Overview</div>
    <DataTable
        v-model:filters="filters"
        :value="allUsers"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5,10,25,50,100]"
        filterDisplay="menu"
        :globalFilterFields="['type', 'firstName', 'lastName', 'fullName']"
    >
      <template #header>
        <div class="flex justify-content-end">
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search" />
                    </span>
        </div>
      </template>
<!--      TODO: Change this to gewisId, is id for testing purposes-->
      <Column field="id" header="GEWIS ID" />
      <Column field="firstName" header="First Name" />
      <Column field="lastName" header="Last Name" />
      <Column field="type" header="Type" :showFilterMatchModes="false">
        <template #filter="{ filterModel, filterCallback}">
          <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="userTypes" placeholder="Select Type" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import {useUserStore} from "@sudosos/sudosos-frontend-common";
import {onMounted, ref, Ref} from "vue";
import apiService from "@/services/ApiService";
import type {UserResponse} from "@sudosos/sudosos-client";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {FilterMatchMode} from "primevue/api";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";

const userStore = useUserStore();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: {value: null, matchMode: FilterMatchMode.EQUALS},
  firstName: {value: null, matchMode: FilterMatchMode.CONTAINS},
  lastName: {value: null, matchMode: FilterMatchMode.CONTAINS},
});
const allUsers: Ref<UserResponse[]> = ref([]);
const userTypes = ["MEMBER", "ORGAN", "BORRELKAART", "LOCAL_USER", "LOCAL_ADMIN", "INVOICE", "AUTOMATIC_INVOICE"];
onMounted(async () => {
  await userStore.fetchUsers(apiService);
  allUsers.value = userStore.users;
  allUsers.value = allUsers.value.map((user: UserResponse) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
  }));
})
</script>

<style scoped>
@import "../styles/BasePage.css";

/* Style for the DataTable header */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f8f8;
  border-top: none;
  text-transform: uppercase;
  font-family: Lato,Arial,sans-serif!important;
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
  font-family: Lato,Arial,sans-serif!important;
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
</style>
