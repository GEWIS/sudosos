<template>
  <InvoiceTable
      :invoices="invoices"
      :totalRecords="totalRecords"
      :isLoading="isLoading"
      :rows="rows"
      @page="onPage"
      @stateFilterChange="onStateFilterChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType } from "vue";
import InvoiceTable from "@/modules/financial/components/invoice/InvoiceTable.vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import { useInvoiceStore } from "@/stores/invoice.store";

const invoiceStore = useInvoiceStore();

const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);
const invoices = ref<InvoiceResponse[]>([]);
const rows = ref<number>(10);
const page = ref<number>(0);
const filterState = ref<InvoiceStatusResponseStateEnum | null>(null);

const props = defineProps({
  state: {
    type: String as PropType<InvoiceStatusResponseStateEnum>,
  },
  year: {
    type: Number,
    required: true,
  }
});

onMounted(async () => {
  await loadInvoices();
});

async function loadInvoices() {
  isLoading.value = true;

  // If a year is provided, compute the date range based on the year.
  // Example: for year 2025, fromDate = "2024-07-01" and tillDate = "2025-07-01"
  let queryParams: Record<string, any> = { };
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

async function onPage(event: any) {
  rows.value = event.rows;
  page.value = event.first;
  await loadInvoices();
}

function onStateFilterChange(e: any) {
  filterState.value = e.value;
  console.log(filterState.value);
  loadInvoices();
}
</script>
