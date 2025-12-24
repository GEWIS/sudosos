<template>
  <DataTable
    filter-display="menu"
    :filters="filters"
    :global-filter-fields="['type', 'firstName', 'lastName', 'fullName']"
    lazy
    :loading="isLoading"
    paginator
    :rows="rows"
    :rows-per-page-options="rowsPerPageOptions"
    :total-records="totalRecords"
    :value="users"
    @filter="emit('filter', $event)"
    @page="emit('page', $event)"
    @sort="emit('sort', $event)"
    @update:filters="(v) => emit('update:filters', v)"
  >
    <template #header>
      <div class="items-center flex flex-row justify-between">
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            :model-value="searchQuery"
            :placeholder="t('common.search')"
            @update:model-value="(v) => emit('update:searchQuery', v)"
          />
        </IconField>
        <Button icon="pi pi-plus" :label="t('common.create')" @click="emit('show-create')" />
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
          <Checkbox
            binary
            :model-value="isActiveFilter"
            @change="emit('filter')"
            @update:model-value="(v) => emit('update:isActiveFilter', v)"
          />
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
          <Checkbox
            binary
            :model-value="ofAgeFilter"
            @change="emit('filter')"
            @update:model-value="(v) => emit('update:ofAgeFilter', v)"
          />
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
        <Button icon="pi pi-window-maximize" outlined type="button" @click="emit('info', slotProps.data)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Button from 'primevue/button';
import Select from 'primevue/select';
import type { BaseUserResponse } from '@sudosos/sudosos-client';

const { t } = useI18n();

defineProps<{
  users: (BaseUserResponse & { fullName: string })[];
  isLoading: boolean;
  filters: Record<string, { value: string | null; matchMode: string }>;
  searchQuery: string;
  userTypes: { name: string; value: string }[];
  totalRecords: number;
  rows?: number;
  rowsPerPageOptions?: number[];
  isActiveFilter: boolean;
  ofAgeFilter: boolean;
}>();

const emit = defineEmits([
  'filter',
  'page',
  'sort',
  'update:filters',
  'update:searchQuery',
  'update:isActiveFilter',
  'update:ofAgeFilter',
  'show-create',
  'info',
]);
</script>
