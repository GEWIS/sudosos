<template>
  <InvoiceTable
    :invoices="invoices"
    :is-loading="isLoading"
    :rows="rows"
    :total-records="totalRecords"
    @page="onPage"
    @state-filter-change="onStateFilterChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { InvoiceStatusResponseStateEnum } from '@sudosos/sudosos-client/src/api';
import type { SelectChangeEvent } from 'primevue/select';
import type { DataTablePageEvent } from 'primevue/datatable';
import InvoiceTable from '@/modules/financial/components/invoice/InvoiceTable.vue';
import { useInvoiceStore } from '@/stores/invoice.store';

const invoiceStore = useInvoiceStore();

const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);
const invoices = ref<InvoiceResponse[]>([]);
const rows = ref<number>(10);
const page = ref<number>(0);
const filterState = ref<InvoiceStatusResponseStateEnum | null>(null);

const props = defineProps<{
  state?: InvoiceStatusResponseStateEnum;
  year: number;
}>();

onMounted(async () => {
  await loadInvoices();
});

async function loadInvoices() {
  isLoading.value = true;

  // If a year is provided, compute the date range based on the year.
  // Example: for year 2025, fromDate = "2024-07-01" and tillDate = "2025-07-01"
  const queryParams: Record<string, string> = {};
  if (props.year) {
    queryParams.fromDate = `${props.year - 1}-07-01T00:00:00.000Z`;
    queryParams.tillDate = `${props.year}-07-01T00:00:00.000Z`;
  }

  if (filterState.value) {
    queryParams.state = filterState.value;
  }

  const response = await invoiceStore.fetchInvoices(rows.value, page.value, queryParams);
  if (response) {
    invoices.value = response.records as InvoiceResponse[];
    totalRecords.value = response._pagination.count || 0;
  }
  isLoading.value = false;
}

async function onPage(event: DataTablePageEvent) {
  rows.value = event.rows;
  page.value = event.first;
  await loadInvoices();
}

function onStateFilterChange(e: SelectChangeEvent) {
  filterState.value = e.value as InvoiceStatusResponseStateEnum;
  void loadInvoices();
}
</script>
