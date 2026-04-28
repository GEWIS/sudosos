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
  <PayoutTable
    :is-loading="isLoading"
    :payouts="records"
    :rows="rows"
    :total-records="totalRecords"
    @page="onPage"
    @state-filter-change="setFilter"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { type BasePayoutRequestResponse, PayoutRequestStatusRequestStateEnum } from '@gewis/sudosos-client';
import { watch } from 'vue';
import { usePayoutStore } from '@/stores/payout.store';
import { useTransferTableYear } from '@/composables/transferTableYear';
import PayoutTable from '@/modules/financial/components/payout/PayoutTable.vue';

const { t } = useI18n();
const payoutStore = usePayoutStore();

async function fetchPayouts({
  page,
  rows,
  filters,
  fiscalStart,
  fiscalEnd,
}: {
  year: number;
  page: number;
  rows: number;
  filters: { state?: PayoutRequestStatusRequestStateEnum };
  fiscalStart: string;
  fiscalEnd: string;
}) {
  return payoutStore.fetchPayouts(rows, page, {
    status: filters.state,
    fromDate: fiscalStart,
    tillDate: fiscalEnd,
  });
}

async function fetchSinglePayout(id: number) {
  return payoutStore.fetchPayout(id);
}

const { year, years, search, rows, isLoading, records, totalRecords, onPage, setFilter, reload, searchById } =
  useTransferTableYear<BasePayoutRequestResponse, { state?: PayoutRequestStatusRequestStateEnum }>(
    fetchPayouts,
    fetchSinglePayout,
    {
      initialFilters: { state: undefined },
      defaultRows: 10,
      syncQueryParams: {
        serializeFilters: (f) => ({ state: f.state }),
        deserializeFilters: (q) => ({
          state: typeof q.state === 'string' ? (q.state as PayoutRequestStatusRequestStateEnum) : undefined,
        }),
      },
    },
  );

watch(
  () => payoutStore.getUpdatedAt,
  () => void reload(),
);
</script>
