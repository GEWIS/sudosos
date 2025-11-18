<template>
  <DataTable
    data-key="id"
    lazy
    :loading="isLoading"
    :paginator="paginator"
    :rows="rows"
    :rows-per-page-options="[5, 10, 25, 50, 100]"
    table-style="min-width: 50rem"
    :total-records="totalRecords"
    :value="rowValues"
    @page="onPage($event)"
  >
    <Column field="id" :header="t('common.id')">
      <template #body="slotProps">
        <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
        <span v-else>{{ slotProps.data.id }}</span>
      </template>
    </Column>
    <Column field="name" :header="t('common.name')">
      <template #body="slotProps">
        <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-8" />
        <span v-else>{{ slotProps.data.name }}</span>
      </template>
    </Column>
    <Column v-if="hasPercentage" field="percentage" :header="t('modules.financial.invoice.vat.percentage')">
      <template #body="slotProps">
        <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
        <span v-else>{{ slotProps.data.percentage + '%' }}</span>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { VatGroupResponse } from '@sudosos/sudosos-client';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { AxiosError } from 'axios';
import ApiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();

const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);

const rows = ref<number>(10);
const paginator = ref<boolean>(true);

const vatGroups = ref<VatGroupResponse[]>([]);
const rowValues = computed(() => {
  if (isLoading.value) return Array(rows.value).fill(null);
  return vatGroups.value;
});

const hasPercentage = computed(() => {
  return vatGroups.value.length > 0 && 'percentage' in (vatGroups.value[0] || {});
});

onMounted(async () => {
  await loadVatGroups(0);
});

async function loadVatGroups(skip = 0) {
  isLoading.value = true;
  try {
    const response = await ApiService.vatGroups.getAllVatGroups(
      undefined,
      undefined,
      undefined,
      false,
      rows.value,
      skip,
    );
    if (response.data) {
      vatGroups.value = response.data.records;
      totalRecords.value = response.data._pagination?.count || 0;
    }
  } catch (error) {
    const toast = useToast();
    if (error instanceof AxiosError) handleError(error, toast);
    else console.error('Failed to load VAT groups:', error);
  } finally {
    isLoading.value = false;
  }
}

async function onPage(event: DataTablePageEvent) {
  rows.value = event.rows;
  await loadVatGroups(event.first);
}
</script>

<style scoped lang="scss"></style>
