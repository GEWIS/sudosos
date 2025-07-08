<template>
  <Tabs v-model:value="year" class="w-full">
    <TabList>
      <Tab v-for="y in years" :key="y" :value="y.toString()">{{ y }}</Tab>
    </TabList>
  </Tabs>
  <WriteOffTable
    :is-loading="isLoading"
    :rows="rows"
    :total-records="totalRecords"
    :write-offs="records"
    @page="onPage"
    @single="onSingle"
  />
</template>

<script setup lang="ts">
import type { WriteOffResponse } from '@sudosos/sudosos-client';
import { useFiscalYear } from '@/composables/fiscalYear';
import { useWriteOffStore } from '@/stores/writeoff.store';
import { useDataTableYear } from '@/composables/dataTableYear';
import type { DataTableFetchParams, DataTableFetchResult } from '@/utils/pagination';
import WriteOffTable from '@/modules/financial/components/write-offs/WriteOffTable.vue';
const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
const years = getFiscalYearList();
const writeOffStore = useWriteOffStore();

async function fetchWriteOffs({
  year,
  page,
  rows,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- rquired for type inference
  filters,
}: DataTableFetchParams<Record<string, unknown>>): Promise<DataTableFetchResult<WriteOffResponse>> {
  const { start, end } = getFiscalYearRange(year);
  return await writeOffStore.fetchWriteOffs(rows, page, start, end);
}

function fetchSingleWriteOff(id: number) {
  return writeOffStore.fetchWriteOff(id);
}

const { year, rows, isLoading, records, totalRecords, onPage, onSingle } = useDataTableYear<
  WriteOffResponse,
  Record<string, unknown>
>(fetchWriteOffs, fetchSingleWriteOff, {
  yearList: years,
  defaultYear: years[0],
});
</script>
