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
      @info="(u) => navigateUser(u.id, true)"
      @page="onPage"
      @show-create="showDialog = true"
      @sort="onSort"
      @update:filters="(v) => (filters = v)"
      @update:is-active-filter="(v) => (isActiveFilter = v)"
      @update:of-age-filter="(v) => (ofAgeFilter = v)"
      @update:search-query="(v) => (searchQuery = v)"
    />

    <AdminUserCreateDialog
      v-model:model-value="showDialog"
      :pre-typed="false"
      @submit="(u) => navigateUser(u.id, false)"
    />
  </CardComponent>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';
import AdminUserTable from '@/modules/admin/components/users/AdminUserTable.vue';
import AdminUserCreateDialog from '@/modules/admin/components/users/AdminUserCreateDialog.vue';
import { usePaginatedUsers } from '@/composables/paginatedUsers';
import { useNavigateUser } from '@/composables/navigateUser';
import { userTypes } from '@/utils/validation-schema';

const { t } = useI18n();
const { navigateUser } = useNavigateUser();

const showDialog = ref(false);

const {
  searchQuery,
  filters,
  isActiveFilter,
  ofAgeFilter,
  isLoading,
  totalRecords,
  rows,
  rowsPerPageOptions,
  sortedUsers,
  onPage,
  onSort,
  onFilter,
} = usePaginatedUsers();
</script>
