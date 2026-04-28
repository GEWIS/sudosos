<template>
  <IconField icon-position="left">
    <InputIcon class="pi pi-search" />
    <InputText
      v-model="search"
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
  <WriteOffTable
    :is-loading="isLoading"
    :rows="rows"
    :total-records="totalRecords"
    :write-offs="records"
    @page="onPage"
  />
</template>

<script setup lang="ts">
import type { WriteOffResponse } from '@gewis/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useWriteOffStore } from '@/stores/writeoff.store';
import WriteOffTable from '@/modules/financial/components/write-offs/WriteOffTable.vue';
import { useTransferTableYear } from '@/composables/transferTableYear';
const writeOffStore = useWriteOffStore();
const { t } = useI18n();
const { year, years, search, rows, isLoading, records, totalRecords, onPage, searchById } = useTransferTableYear<
  WriteOffResponse,
  Record<string, unknown>
>(fetchWriteOffs, fetchSingleWriteOff, {
  defaultRows: 10,
  syncQueryParams: true,
});

async function fetchWriteOffs({
  page,
  rows,
  fiscalStart,
  fiscalEnd,
}: {
  year: number;
  page: number;
  rows: number;
  filters: Record<string, unknown>;
  fiscalStart: string;
  fiscalEnd: string;
}) {
  return await writeOffStore.fetchWriteOffs(rows, page, fiscalStart, fiscalEnd);
}

function fetchSingleWriteOff(id: number) {
  return writeOffStore.fetchWriteOff(id);
}
</script>
