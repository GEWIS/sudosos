<template>
  <CardComponent class="w-full" :header="t('modules.admin.userOverview.list.header')">
    <AdminUserTable
      :filters="filters"
      :is-active-filter="isActiveFilter"
      :is-loading="isLoading"
      :of-age-filter="ofAgeFilter"
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      :search-query="searchQuery"
      :total-records="totalRecords"
      :user-types="userTypes"
      :users="sortedUsers"
      @filter="onFilter"
      @info="handleInfoPush"
      @page="onPage"
      @show-create="showDialog = true"
      @sort="onSort"
      @update:filters="(v) => (filters = v)"
      @update:is-active-filter="(v) => (isActiveFilter = v)"
      @update:of-age-filter="(v) => (ofAgeFilter = v)"
      @update:search-query="(v) => (searchQuery = v)"
    />

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
  </CardComponent>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import type { UserResponse } from '@sudosos/sudosos-client';
import router from '@/router';
import CardComponent from '@/components/CardComponent.vue';
import AdminUserTable from '@/modules/admin/components/users/AdminUserTable.vue';
import FormDialog from '@/components/FormDialog.vue';
import UserCreateForm from '@/modules/admin/components/users/forms/UserCreateForm.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createUserSchema, userTypes } from '@/utils/validation-schema';
import { usePaginatedUsers } from '@/composables/paginatedUsers';

const { t } = useI18n();
const userStore = useUserStore();

const showDialog = ref(false);
const form = schemaToForm(createUserSchema);

const {
  searchQuery,
  filters,
  isActiveFilter,
  ofAgeFilter,
  isLoading,
  totalRecords,
  allUsers,
  rows,
  rowsPerPageOptions,
  sortedUsers,
  onPage,
  onSort,
  onFilter,
} = usePaginatedUsers();

function handleInfoPush(userId: number) {
  const clickedUser: UserResponse | undefined = allUsers.value.find((record) => record.id == userId);
  if (clickedUser) userStore.addUser(clickedUser);
  const route = router.resolve({ name: 'user', params: { userId } });
  window.open(route.href, '_blank');
}
</script>
