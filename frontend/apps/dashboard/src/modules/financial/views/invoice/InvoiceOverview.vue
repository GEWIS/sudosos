<template>
  <PageContainer>
    <div class="flex flex-col">
      <InvoiceAccountOverview />
      <EntityTable
        v-model:search="search"
        v-model:year="year"
        :data-table-props="{ filterDisplay: 'menu', filters }"
        :is-loading="isLoading"
        :records="records"
        :rows="rows"
        :search-placeholder="t('common.description')"
        :title="t('modules.financial.invoice.header')"
        :total-records="totalRecords"
        :years="years"
        @page="onPage"
      >
        <template #columns="{ isLoading: loading }">
          <Column class="max-w-[2rem]" field="id" :header="t('common.id')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="skeleton-fixed surface-300 max-w-[2rem]" />
              <span v-else>{{ data.id }}</span>
            </template>
          </Column>

          <Column class="max-w-[4rem]" field="reference" :header="t('modules.financial.forms.invoice.reference')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="skeleton-fixed surface-300 w-6" />
              <span v-else class="whitespace-nowrap">{{ data.reference }}</span>
            </template>
          </Column>

          <Column field="description" :header="t('common.description')" style="max-width: 10rem">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="skeleton-fixed surface-300 w-6" />
              <AppLink v-else :text="data.description" :to="{ name: 'invoiceInfo', params: { id: data.id } }" />
            </template>
          </Column>

          <Column class="max-w-[4rem]" field="date" :header="t('common.date')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="skeleton-fixed surface-300 w-6" />
              <span
                v-else-if="isBackDate(data)"
                v-tooltip="
                  t('modules.financial.invoice.backDate', { date: formatDateFromString(data.transfer.createdAt) })
                "
                class="text-red-500 whitespace-nowrap"
              >
                {{ formatDateFromString(data.date) }}
              </span>
              <span v-else class="whitespace-nowrap">{{ formatDateFromString(data.date) }}</span>
            </template>
          </Column>

          <Column
            class="max-w-[4rem]"
            field="currentState.state"
            filter
            filter-match-mode="equals"
            :header="t('common.status')"
            :show-apply-button="false"
            :show-clear-button="false"
            :show-filter-match-modes="false"
          >
            <template #filter="{ filterModel }">
              <Select
                v-model="filterModel.value"
                option-label="name"
                option-value="value"
                :options="states"
                :placeholder="t('common.placeholders.selectType')"
                @change="(e) => setFilter('state', e.value)"
              />
            </template>
            <template #body="{ data }">
              <Skeleton v-if="loading" class="skeleton-fixed surface-300 w-6" />
              <template v-else>
                <span v-if="data.currentState.state === InvoiceStatusResponseStateEnum.Created" class="font-bold">
                  {{ t('common.created') }}
                </span>
                <span v-else-if="data.currentState.state === InvoiceStatusResponseStateEnum.Sent" class="italic">
                  {{ t('common.sent') }}
                </span>
                <span v-else-if="data.currentState.state === InvoiceStatusResponseStateEnum.Paid" class="text-gray-500">
                  {{ t('common.paid') }}
                </span>
                <span
                  v-else-if="data.currentState.state === InvoiceStatusResponseStateEnum.Deleted"
                  class="text-red-500"
                >
                  {{ t('common.deleted') }}
                </span>
                <span v-else>{{ data.currentState.state }}</span>
              </template>
            </template>
          </Column>

          <Column class="max-w-[4rem]" field="to.firstName" :header="t('common.for')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="skeleton-fixed surface-300 w-6" />
              <span v-else class="truncate">{{ data.to.firstName }}</span>
            </template>
          </Column>

          <Column field="transfer.amount" :header="t('common.amount')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="skeleton-fixed surface-300 w-3" />
              <span v-else>{{ formatPrice(data.transfer?.amount) }}</span>
            </template>
          </Column>
        </template>
      </EntityTable>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { type InvoiceResponse, type InvoiceResponseTypes, InvoiceStatusResponseStateEnum } from '@gewis/sudosos-client';
import { useInvoiceStore } from '@/stores/invoice.store';
import { useEntityTable } from '@/composables/useEntityTable';
import { useFiscalYear } from '@/composables/fiscalYear';
import { formatPrice, formatDateFromString } from '@/utils/formatterUtils';
import InvoiceAccountOverview from '@/modules/financial/views/invoice/InvoiceAccountOverview.vue';
import PageContainer from '@/layout/PageContainer.vue';
import EntityTable from '@/components/EntityTable.vue';
import AppLink from '@/components/AppLink.vue';

const { t } = useI18n();
const invoiceStore = useInvoiceStore();
const { getFiscalYear } = useFiscalYear();

const states = ref([
  { name: InvoiceStatusResponseStateEnum.Created, value: InvoiceStatusResponseStateEnum.Created },
  { name: InvoiceStatusResponseStateEnum.Sent, value: InvoiceStatusResponseStateEnum.Sent },
  { name: InvoiceStatusResponseStateEnum.Paid, value: InvoiceStatusResponseStateEnum.Paid },
  { name: InvoiceStatusResponseStateEnum.Deleted, value: InvoiceStatusResponseStateEnum.Deleted },
  { name: 'ALL', value: null },
]);

function isBackDate(invoice: InvoiceResponse): boolean {
  if (!invoice.createdAt || !invoice.date) return false;
  return getFiscalYear(invoice.createdAt) !== getFiscalYear(invoice.date);
}

type InvoiceFilters = { state?: InvoiceStatusResponseStateEnum; description?: string };

async function fetchInvoices({
  page,
  rows,
  filters: f,
  fiscalStart,
  fiscalEnd,
}: {
  year: number;
  page: number;
  rows: number;
  filters: InvoiceFilters;
  fiscalStart: string;
  fiscalEnd: string;
}) {
  return invoiceStore.fetchInvoices(rows, page, {
    fromDate: fiscalStart,
    tillDate: fiscalEnd,
    state: f.state,
    description: f.description,
  });
}

const {
  year,
  years,
  search,
  rows,
  isLoading,
  records,
  totalRecords,
  onPage,
  setFilter,
  filters: entityFilters,
} = useEntityTable<InvoiceResponseTypes, InvoiceFilters>(fetchInvoices, undefined, {
  initialFilters: { state: undefined, description: undefined },
  // Search the description (partial match) as you type; the API cannot search by reference.
  searchKey: 'description',
  defaultRows: 10,
  syncQueryParams: {
    serializeFilters: (f) => ({ state: f.state }),
    deserializeFilters: (q) => ({
      state: typeof q.state === 'string' ? (q.state as InvoiceStatusResponseStateEnum) : undefined,
    }),
  },
});

const filters = ref({
  'currentState.state': { value: entityFilters.value.state ?? null, matchMode: 'equals' as const },
});

watch(
  () => entityFilters.value.state,
  (state) => {
    filters.value['currentState.state'].value = state ?? null;
  },
);
</script>

<style scoped lang="scss">
.truncate {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skeleton-fixed {
  height: 1rem;
  margin: 0;
  display: block;
}
</style>
