<template>
  <CardComponent class="w-full" :header="title">
    <template #topAction>
      <Button v-if="createLabel" icon="pi pi-plus" :label="createLabel" @click="$emit('create')" />
    </template>

    <div class="flex flex-col gap-3">
      <IconField icon-position="left">
        <InputIcon class="pi pi-search" />
        <InputText
          :model-value="search"
          :placeholder="searchPlaceholder ?? t('common.id')"
          @focusout="$emit('search')"
          @keyup.enter="$emit('search')"
          @update:model-value="$emit('update:search', $event as string)"
        />
      </IconField>

      <Tabs v-if="useYears" class="w-full" :value="year" @update:value="$emit('update:year', $event as string)">
        <TabList>
          <Tab v-for="y in years" :key="y" :value="y.toString()">{{ y }}</Tab>
        </TabList>
      </Tabs>

      <DataTable
        class="w-full"
        data-key="id"
        lazy
        :paginator="true"
        :rows="rows"
        :rows-per-page-options="[5, 10, 25, 50, 100]"
        table-style="min-width: 50rem"
        :total-records="totalRecords"
        :value="records"
        v-bind="dataTableProps"
        @page="onPage"
      >
        <slot :is-loading="isLoading" name="columns" />
      </DataTable>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { DataTablePageEvent, DataTableProps } from 'primevue/datatable';
import CardComponent from '@/components/CardComponent.vue';

const { t } = useI18n();

withDefaults(
  defineProps<{
    title: string;
    years?: number[];
    year?: string;
    search: string;
    records: unknown[];
    isLoading: boolean;
    rows: number;
    totalRecords: number;
    useYears?: boolean;
    searchPlaceholder?: string;
    createLabel?: string;
    dataTableProps?: Omit<DataTableProps, 'value' | 'rows' | 'totalRecords' | 'lazy' | 'paginator'>;
  }>(),
  {
    useYears: true,
    years: () => [],
    year: '',
    searchPlaceholder: undefined,
    createLabel: undefined,
    dataTableProps: undefined,
  },
);

const emit = defineEmits<{
  'update:year': [value: string];
  'update:search': [value: string];
  search: [];
  create: [];
  page: [event: DataTablePageEvent];
}>();

function onPage(event: DataTablePageEvent) {
  emit('page', event);
}
</script>
