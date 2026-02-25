<template>
  <DataTable
    filter-display="menu"
    :filters="filters"
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
      <template v-else #body="slotProps">
        <ExternalLink
          v-if="slotProps.data.gewisId"
          :text="slotProps.data.gewisId"
          :url="`https://gewis.nl/member/${slotProps.data.gewisId}`"
        />
      </template>
    </Column>
    <Column field="fullName" :header="t('common.name')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-8" />
      </template>
      <template v-else #body="slotProps">
        <UserLink :user="slotProps.data" />
      </template>
    </Column>
    <Column field="type" :header="t('common.type')" :show-filter-match-modes="false">
      <template #filter="{ filterModel }">
        <Select
          v-model="filterModel.value"
          option-label="name"
          option-value="name"
          :options="userTypes"
          :placeholder="t('common.placeholders.selectType')"
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
        </div>
      </template>
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-2" />
      </template>
      <template #filter="{ filterModel }">
        <Select
          v-model="filterModel.value"
          option-label="label"
          option-value="value"
          :options="[
            { label: t('common.active'), value: true },
            { label: t('common.inactive'), value: false },
          ]"
          :placeholder="t('common.placeholders.select')"
        />
      </template>
    </Column>
    <Column field="ofAge" :show-filter-match-modes="false">
      <template #header>
        <div class="items-center flex flex-row gap-2">
          {{ t('common.ofAge') }}
        </div>
      </template>
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template #filter="{ filterModel }">
        <Select
          v-model="filterModel.value"
          option-label="label"
          option-value="value"
          :options="[
            { label: '18+', value: true },
            { label: '18-', value: false },
          ]"
          :placeholder="t('common.placeholders.select')"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { BaseUserResponse } from '@sudosos/sudosos-client';
import UserLink from '@/components/UserLink.vue';
import ExternalLink from '@/components/ExternalLink.vue';

const { t } = useI18n();

defineProps<{
  users: (BaseUserResponse & { fullName: string })[];
  isLoading: boolean;
  filters: Record<string, { value: string | string[] | boolean | null; matchMode: string }>;
  searchQuery: string;
  userTypes: { name: string; value: string }[];
  totalRecords: number;
  rows?: number;
  rowsPerPageOptions?: number[];
}>();

const emit = defineEmits(['filter', 'page', 'sort', 'update:filters', 'update:searchQuery', 'show-create', 'info']);
</script>
