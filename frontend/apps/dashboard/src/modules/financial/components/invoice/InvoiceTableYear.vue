<template>
  <IconField icon-position="left">
    <InputIcon class="pi pi-search" />
    <InputText
      v-model="searchId"
      :placeholder="t('common.id')"
      @focusout="searchById"
      @keyup.enter="searchById"
      @submit="searchById"
    />
  </IconField>
  <Tabs v-model:value="year" class="w-full">
    <TabList>
      <Tab v-for="y in years" :key="y" :value="y.toString()">{{ y }}</Tab>
    </TabList>
  </Tabs>
  <InvoiceTable
    :invoices="records"
    :is-loading="isLoading"
    :rows="rows"
    :total-records="totalRecords"
    @page="onPage"
    @state-filter-change="setFilter"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { InvoiceStatusResponseStateEnum } from '@sudosos/sudosos-client';
import { type InvoiceResponseTypes } from '@sudosos/sudosos-client/src/api';
import InvoiceTable from '@/modules/financial/components/invoice/InvoiceTable.vue';
import { useFiscalYear } from '@/composables/fiscalYear';
import { useInvoiceStore } from '@/stores/invoice.store';
import { useDataTableYear } from '@/composables/dataTableYear';

const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
const years = getFiscalYearList();
const invoiceStore = useInvoiceStore();
const filterState = ref<InvoiceStatusResponseStateEnum | undefined>(undefined);
const searchId = ref<string | null>(null);

const { t } = useI18n();
const toast = useToast();

async function fetchInvoices({
  year,
  page,
  rows,
  filters,
}: {
  year: number;
  page: number;
  rows: number;
  filters: { state?: InvoiceStatusResponseStateEnum };
}) {
  const { start, end } = getFiscalYearRange(year);
  const queryParams = {
    fromDate: start,
    tillDate: end,
    ...(filters?.state ? { state: filters.state } : {}),
  };
  return await invoiceStore.fetchInvoices(rows, page, queryParams);
}

async function fetchSingleInvoice(id: number) {
  return await invoiceStore.fetchInvoice(id);
}

const { year, rows, isLoading, records, totalRecords, onPage, setFilter, onSingle } = useDataTableYear<
  InvoiceResponseTypes,
  { state?: InvoiceStatusResponseStateEnum }
>(fetchInvoices, fetchSingleInvoice, {
  yearList: years,
  defaultYear: years[0]!,
  initialFilters: { state: filterState.value },
  defaultRows: 10,
});

function searchById() {
  const id = Number(searchId.value);
  if (isNaN(id)) return;
  onSingle(id).catch(() => {
    toast.add({
      severity: 'warn',
      summary: t('common.toast.info.info'),
      detail: t('common.toast.info.notFound'),
      life: 3000,
    });
  });
}
</script>
