<template>
  <div class="full-width my-4">
    <CardComponent :header="t('modules.financial.invoice.account.header')" class="full-width">
      <DataTable
          v-model:filters="filters"
          :value="sortedUsers.length > 0 ? sortedUsers : allUsersFullData"
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
        <Column field="balance" :showFilterMatchModes="false">
          <template #header>
            <div class="flex flex-row gap-2 align-items-center">
              {{ t('modules.financial.invoice.account.balance') }}
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
                class="p-button-rounded p-button-text p-button-plain"
            />
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
            <Button icon="pi pi-file-edit"
                    @click="handleInvoicePush(slotProps.data.id)"
                    class="p-button-rounded p-button-text p-button-plain"
                    type="button"
            />
          </template>

        </Column>
      </DataTable>
    </CardComponent>
    <FormDialog :header="t('modules.admin.forms.user.header')" v-model:modelValue="showDialog"
                :form="form"  :is-editable="false">
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
import apiService, { DEFAULT_PAGINATION_MAX } from '@/services/ApiService';
import type { BaseUserResponse, GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from 'primevue/api';
import InputText from 'primevue/inputtext';
import { createUserSchema } from "@/utils/validation-schema";
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
import { formatPrice } from "@/utils/formatterUtils";


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
const allUsersFullData: Ref<GewisUserResponse[]> = computed(() => {
  const userData : GewisUserResponse[] =  allUsers.value.map((user) => {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      balance: formatPrice(userStore.getBalanceById(user.id).amount),
    };
  });
  return userData.filter(isNotZero);
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
          DEFAULT_PAGINATION_MAX,
          skip,
          searchQuery.value.split(' ')[0] || '',
          isActiveFilter.value ? isActiveFilter.value : undefined,
          ofAgeFilter.value,
          undefined,
          "INVOICE" || undefined
      )
      .then((response) => {
        totalRecords.value = response.data._pagination.count || 0;
        allUsers.value = response.data.records;
        userStore.addUsers(allUsers.value);
        userStore.fetchUserBalances(allUsers.value, apiService);
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
  const fuzzed: UserResponse[] = new Fuse(allUsersFullData.value, {
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
  let route = router.resolve({ name: 'user', params: { userId } });
  window.open(route.href, '_blank');
}

function handleInvoicePush(userId : number) {
  router.push({ name: 'invoiceCreate', query: { userId: userId } });
}

function isNotZero(user: BaseUserResponse) {
  return userStore.getBalanceById(user.id).amount.amount != 0;
}
</script>

<style scoped>
</style>