<template>
  <DataTable
    v-model:selection="selectedCosts"
    data-key="id"
    lazy
    :loading="isLoading"
    paginator
    :rows="rows"
    :rows-per-page-options="rowsPerPageOptions"
    selection-mode="multiple"
    table-style="min-width: 50rem"
    :total-records="pagination.count"
    :value="costs"
    @page="onPage"
  >
    <Column v-if="showSelection" selection-mode="multiple" style="width: 3rem" />

    <Column field="id" :header="t('common.id')" :sortable="true">
      <template #body="slotProps">
        <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
        <span v-else>{{ slotProps.data.id }}</span>
      </template>
    </Column>

    <Column field="from" :header="t('modules.financial.administrative.user')" :sortable="true">
      <template #body="slotProps">
        <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
        <UserLink v-else :user="slotProps.data.from" />
      </template>
    </Column>

    <Column field="amount" :header="t('common.amount')" :sortable="true">
      <template #body="slotProps">
        <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
        <span v-else>{{ formatDineroObject(slotProps.data.amount) }}</span>
      </template>
    </Column>

    <Column field="createdAt" :header="t('common.date')" :sortable="true">
      <template #body="slotProps">
        <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
        <span v-else>{{ formatDateFromString(slotProps.data.createdAt) }}</span>
      </template>
    </Column>

    <Column :header="t('common.actions')" style="width: 15%">
      <template #body="slotProps">
        <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
        <span v-else class="flex flex-row align-items-center gap-2">
          <Button
            v-tooltip.top="t('common.view')"
            class="p-button-rounded p-button-text p-button-plain"
            icon="pi pi-eye"
            type="button"
            @click="emit('view', slotProps.data.id)"
          />
          <Button
            v-tooltip.top="t('common.delete')"
            class="p-button-rounded p-button-text p-button-plain"
            icon="pi pi-trash"
            type="button"
            @click="emit('delete', slotProps.data.id)"
          />
        </span>
      </template>
    </Column>
  </DataTable>

  <div v-if="showSelection && selectedCosts.length > 0" class="mt-3 flex flex-row justify-between items-center">
    <span class="flex items-center">{{
      t('modules.financial.administrative.selectedCount', { count: selectedCosts.length })
    }}</span>
    <div class="flex flex-row gap-2 items-center">
      <Button :label="t('common.clearSelection')" outlined @click="selectedCosts = []" />
      <Button
        :label="t('common.delete')"
        severity="danger"
        @click="
          emit(
            'bulkDelete',
            selectedCosts.map((c) => c.id),
          )
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { BaseInactiveAdministrativeCostResponse } from '@sudosos/sudosos-client';
import type { DataTablePageEvent } from 'primevue/datatable';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import { useI18n } from 'vue-i18n';
import { formatDateFromString, formatDineroObject } from '@/utils/formatterUtils';
import UserLink from '@/components/UserLink.vue';

interface Props {
  costs: BaseInactiveAdministrativeCostResponse[];
  isLoading: boolean;
  pagination: {
    take: number;
    skip: number;
    count: number;
  };
  rows: number;
  rowsPerPageOptions?: number[];
  showSelection?: boolean;
}

withDefaults(defineProps<Props>(), {
  rowsPerPageOptions: () => [10, 25, 50, 100],
  showSelection: false,
});

const emit = defineEmits<{
  page: [event: DataTablePageEvent];
  view: [id: number];
  delete: [id: number];
  bulkDelete: [ids: number[]];
}>();

const { t } = useI18n();

const selectedCosts = ref<BaseInactiveAdministrativeCostResponse[]>([]);

function onPage(event: DataTablePageEvent) {
  emit('page', event);
}
</script>

<style scoped lang="scss"></style>
