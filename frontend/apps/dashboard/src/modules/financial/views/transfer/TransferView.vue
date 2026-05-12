<template>
  <PageContainer class="max-w-[100rem]">
    <div class="flex flex-col gap-5 lg:flex-row">
      <EntityTable
        v-model:search="search"
        v-model:year="year"
        v-model:selection="selectedRows"
        :is-loading="isLoading"
        :records="records"
        :rows="rows"
        :total-records="totalRecords"
        :years="years"
        :title="t('modules.financial.transfer.title')"
        :search-placeholder="t('common.id')"
        :data-table-props="{ selectionMode: 'multiple' }"
        @page="onPage"
        @search="searchById"
      >
        <template #columns="{ isLoading: loading }">
          <Column selection-mode="multiple" style="width: 3rem" />

          <Column field="id" :header="t('common.id')">
            <template #body="{ data }">
              <Skeleton v-if="loading" height="1rem" />
              <span v-else>{{ (data as TransferResponse).id }}</span>
            </template>
          </Column>

          <Column :header="t('common.date')">
            <template #body="{ data }">
              <Skeleton v-if="loading" height="1rem" />
              <span v-else>{{ formatDateFromString((data as TransferResponse).createdAt) }}</span>
            </template>
          </Column>

          <Column :header="t('common.from')">
            <template #body="{ data }">
              <Skeleton v-if="loading" height="1rem" />
              <span v-else>{{
                (data as TransferResponse).from
                  ? `${(data as TransferResponse).from!.firstName} ${(data as TransferResponse).from!.lastName}`
                  : t('common.na')
              }}</span>
            </template>
          </Column>

          <Column :header="t('common.to')">
            <template #body="{ data }">
              <Skeleton v-if="loading" height="1rem" />
              <span v-else>{{
                (data as TransferResponse).to
                  ? `${(data as TransferResponse).to!.firstName} ${(data as TransferResponse).to!.lastName}`
                  : t('common.na')
              }}</span>
            </template>
          </Column>

          <Column field="description" :header="t('common.description')" style="max-width: 16rem">
            <template #body="{ data }">
              <Skeleton v-if="loading" height="1rem" />
              <span v-else class="description-cell" :title="(data as TransferResponse).description">{{
                (data as TransferResponse).description
              }}</span>
            </template>
          </Column>
          <Column
            class="font-mono text-right"
            header-class="text-right"
            :header="t('modules.financial.financialOverview.table.credit')"
          >
            <template #body="{ data }">
              <Skeleton v-if="loading" height="1rem" />
              <span v-else>{{
                (data as TransferResponse).from == null ? formatDineroObject((data as TransferResponse).amount) : '—'
              }}</span>
            </template>
          </Column>

          <Column
            class="font-mono text-right"
            header-class="text-right"
            :header="t('modules.financial.financialOverview.table.debit')"
          >
            <template #body="{ data }">
              <Skeleton v-if="loading" height="1rem" />
              <span v-else>{{
                (data as TransferResponse).to == null ? formatDineroObject((data as TransferResponse).amount) : '—'
              }}</span>
            </template>
          </Column>

          <Column
            class="font-mono text-right"
            header-class="text-right"
            :header="t('modules.financial.transfer.saldo')"
          >
            <template #body="{ data }">
              <Skeleton v-if="loading" height="1rem" />
              <span v-else :class="saldoClass(data as TransferResponse)">{{
                formatSaldo(data as TransferResponse)
              }}</span>
            </template>
          </Column>
        </template>
      </EntityTable>

      <TransferAggregateWidget
        :category="category"
        :from-date="fromDate"
        :till-date="tillDate"
        :selected-rows="selectedRows"
        class="shrink-0 self-start lg:w-72"
      />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AxiosResponse } from 'axios';
import type { TransferResponse } from '@gewis/sudosos-client';
import ApiService from '@/services/ApiService';
import { useEntityTable } from '@/composables/useEntityTable';
import { useFiscalYear } from '@/composables/fiscalYear';
import { formatDateFromString, formatDineroObject } from '@/utils/formatterUtils';
import { getDescription, parseTransfer } from '@/utils/mutationUtils';
import EntityTable from '@/components/EntityTable.vue';
import PageContainer from '@/layout/PageContainer.vue';
import TransferAggregateWidget from '@/modules/financial/components/transfer/TransferAggregateWidget.vue';

const props = defineProps<{ category: string }>();

const { t } = useI18n();
const { getFiscalYearRange } = useFiscalYear();

const selectedRows = ref<TransferResponse[]>([]);
const selectedCategory = ref<string | undefined>(undefined);

const categoryOptions = [
  { value: 'deposit', label: t('modules.financial.financialOverview.transferTypes.deposits') },
  { value: 'payoutRequest', label: t('modules.financial.financialOverview.transferTypes.payoutRequests') },
  { value: 'sellerPayout', label: t('modules.financial.financialOverview.transferTypes.sellerPayouts') },
  { value: 'invoice', label: t('modules.financial.financialOverview.transferTypes.invoices') },
  { value: 'creditInvoice', label: t('modules.financial.financialOverview.transferTypes.creditInvoices') },
  { value: 'fine', label: t('modules.financial.financialOverview.transferTypes.fines') },
  { value: 'waivedFines', label: t('modules.financial.financialOverview.transferTypes.waivedFines') },
  { value: 'writeOff', label: t('modules.financial.financialOverview.transferTypes.writeOffs') },
  { value: 'inactiveAdministrativeCost', label: t('modules.financial.financialOverview.transferTypes.adminCosts') },
  { value: 'manualCreation', label: t('modules.financial.financialOverview.transferTypes.manualCreations') },
  { value: 'manualDeletion', label: t('modules.financial.financialOverview.transferTypes.manualDeletions') },
];

async function fetchRecords({
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
  const res = (await ApiService.transfers.getAllTransfers({
    fromDate: fiscalStart,
    tillDate: fiscalEnd,
    category: selectedCategory.value ?? props.category,
    take: rows,
    skip: page,
  })) as unknown as AxiosResponse<{ _pagination: { count: number }; records: TransferResponse[] }>;
  return { records: res.data.records, _pagination: res.data._pagination };
}

const { year, years, search, rows, isLoading, records, totalRecords, onPage, searchById, reload } = useEntityTable(
  fetchRecords,
  undefined,
  { defaultRows: 25, syncQueryParams: true },
);

const fromDate = computed(() => getFiscalYearRange(Number(year.value)).start);
const tillDate = computed(() => getFiscalYearRange(Number(year.value)).end);

function onCategoryChange() {
  selectedRows.value = [];
  void reload();
}

function credit(data: TransferResponse): number {
  return data.from == null ? data.amount.amount : 0;
}

function debit(data: TransferResponse): number {
  return data.to == null ? data.amount.amount : 0;
}

function formatSaldoAmount(cents: number): string {
  const absVal = Math.abs(cents) / 100;
  const sign = cents >= 0 ? '+' : '-';
  return `${sign}${absVal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;
}

function formatSaldo(data: TransferResponse): string {
  return formatSaldoAmount(credit(data) - debit(data));
}

function saldoClass(data: TransferResponse): string {
  const saldo = credit(data) - debit(data);
  if (saldo > 0) return 'text-green-600';
  if (saldo < 0) return 'text-red-600';
  return '';
}
</script>

<style scoped>
.description-cell {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 16rem;
}
</style>
