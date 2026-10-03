<template>
  <DataTable data-key="transferType" :row-class="onRowClass" striped-rows :value="tableData">
    <Column style="width: 3rem">
      <template #body="{ data }">
        <button
          v-if="!loadingState && !data.isChild && data.children?.length > 0"
          class="expander-btn"
          @click="toggleExpand(data.transferType)"
        >
          <i :class="expandedKeys.has(data.transferType) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" />
        </button>
      </template>
    </Column>

    <Column class="text-left" :header="t('modules.financial.financialOverview.table.type')" header-class="font-sans">
      <template #body="{ data }">
        <template v-if="!data.isSeparator">
          <Skeleton v-if="loadingState" height="1rem" />
          <template v-else-if="data.transferCategory">
            <RouterLink
              class="hover:underline"
              :to="{
                name: 'transferView',
                params: { category: data.transferCategory },
                query: { year: props.year.toString() },
              }"
            >
              <span v-if="data.isChild" class="pl-6 text-color-secondary">{{ data.name }}</span>
              <span v-else>{{ data.transferType }}</span>
            </RouterLink>
          </template>
          <span v-else-if="data.isChild" class="pl-6 text-color-secondary">{{ data.name }}</span>
          <span v-else>{{ data.transferType }}</span>
        </template>
      </template>
    </Column>

    <Column
      class="font-mono text-right"
      :header="t('modules.financial.financialOverview.table.credit')"
      header-class="font-sans text-right"
    >
      <template #body="{ data }">
        <template v-if="!data.isSeparator">
          <Skeleton v-if="loadingState" height="1rem" />
          <span v-else>{{ formatCurrency(data.credit || 0) }}</span>
        </template>
      </template>
    </Column>

    <Column
      class="font-mono text-right"
      :header="t('modules.financial.financialOverview.table.debit')"
      header-class="font-sans text-right"
    >
      <template #body="{ data }">
        <template v-if="!data.isSeparator">
          <Skeleton v-if="loadingState" height="1rem" />
          <span v-else>{{ formatCurrency(data.debit || 0) }}</span>
        </template>
      </template>
    </Column>

    <Column
      class="font-mono text-right"
      :header="t('modules.financial.financialOverview.table.balance')"
      header-class="font-sans text-right"
    >
      <template #body="{ data }">
        <template v-if="!data.isSeparator">
          <Skeleton v-if="loadingState" height="1rem" />
          <span v-else>{{ formatCurrency((data.credit || 0) - (data.debit || 0)) }}</span>
        </template>
      </template>
    </Column>

    <ColumnGroup type="footer">
      <Row>
        <Column :colspan="4" :footer="t('modules.financial.financialOverview.table.totalMutations')" />
        <Column class="font-mono text-right" :footer="formatCurrency(totalMutationSaldo)" />
      </Row>

      <Row>
        <Column
          :colspan="4"
          :footer="t('modules.financial.financialOverview.table.balanceAt', { date: formatDateFromString(start) })"
        />
        <Column class="font-mono text-right">
          <template #footer>
            <Skeleton v-if="loadingBalances" height="1rem" />
            <span v-else>{{ formatCurrency(startBalance) }}</span>
          </template>
        </Column>
      </Row>

      <Row>
        <Column
          :colspan="4"
          :footer="t('modules.financial.financialOverview.table.balanceAt', { date: formatDateFromString(end) })"
        />
        <Column
          class="font-mono text-right"
          :class="!loadingBalances && (validationMatch ? 'text-green-600' : 'text-red-600 font-bold')"
        >
          <template #footer>
            <Skeleton v-if="loadingBalances" height="1rem" />
            <span v-else>{{ formatCurrency(endBalance) }}</span>
          </template>
        </Column>
      </Row>
    </ColumnGroup>
  </DataTable>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import { useI18n } from 'vue-i18n';
import type { UserResponse } from '@gewis/sudosos-client';
import type { AxiosError } from 'axios';
import { useToast } from 'primevue/usetoast';
import ApiService from '@/services/ApiService';
import { useFiscalYear } from '@/composables/fiscalYear';
import { formatDateFromString } from '@/utils/formatterUtils';
import { handleError } from '@/utils/errorUtils';

const props = defineProps<{
  year: number;
  sellers: UserResponse[];
}>();

interface ChildRow {
  name: string;
  credit: number;
  debit: number;
  id: number | string;
  transferCategory?: string;
}

interface FinancialOverviewTableRow {
  transferType: string;
  credit: number;
  debit: number;
  children?: ChildRow[];
  isChild?: boolean;
  collapsing?: boolean;
  isSeparator?: boolean;
  name?: string;
  transferCategory?: string;
}

const { t } = useI18n();
const toast = useToast();
const { getFiscalYearRange } = useFiscalYear();
const start = computed(() => getFiscalYearRange(props.year).start);
const end = computed(() => getFiscalYearRange(props.year).end);

const loadingState = ref(true);
const loadingBalances = ref(true);
const financialMutations = ref<FinancialOverviewTableRow[]>([]);
const expandedKeys = ref(new Set<string>());
const collapsingKeys = ref(new Set<string>());

const startBalance = ref(0);
const endBalance = ref(0);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2 }).format(value);
};

const EXPAND_DURATION = 180;

const toggleExpand = (key: string) => {
  if (expandedKeys.value.has(key)) {
    const nextCollapsing = new Set(collapsingKeys.value);
    nextCollapsing.add(key);
    collapsingKeys.value = nextCollapsing;

    setTimeout(() => {
      const nextExpanded = new Set(expandedKeys.value);
      nextExpanded.delete(key);
      expandedKeys.value = nextExpanded;

      const nextCollapsing2 = new Set(collapsingKeys.value);
      nextCollapsing2.delete(key);
      collapsingKeys.value = nextCollapsing2;
    }, EXPAND_DURATION);
  } else {
    const next = new Set(expandedKeys.value);
    next.add(key);
    expandedKeys.value = next;
  }
};

const totalMutationSaldo = computed(() => {
  return financialMutations.value.reduce((acc, r) => acc + (r.credit || 0) - (r.debit || 0), 0);
});

const validationMatch = computed(() => {
  // Use a small epsilon for float comparison just in case
  const expected = Math.round((startBalance.value + totalMutationSaldo.value) * 100);
  const actual = Math.round(endBalance.value * 100);
  return Math.abs(expected - actual) < 1;
});

const onRowClass = (data: FinancialOverviewTableRow) => {
  if (loadingState.value) return 'skeleton-row';
  if (data.isSeparator) return 'separator-row';
  if (data.isChild) return data.collapsing ? 'child-row child-row-out' : 'child-row';
  if (!data.children || data.children.length === 0) return 'no-expander-row';
  return '';
};

const skeletonRows: FinancialOverviewTableRow[] = Array.from({ length: 11 }, (_, i) => ({
  transferType: `skeleton-${i}`,
  credit: 0,
  debit: 0,
}));

const displayRows = computed<FinancialOverviewTableRow[]>(() => {
  const result: FinancialOverviewTableRow[] = [];
  for (const row of financialMutations.value) {
    result.push(row);
    if (row.children && row.children.length > 0) {
      const isExpanded = expandedKeys.value.has(row.transferType);
      const isCollapsing = collapsingKeys.value.has(row.transferType);
      if (isExpanded || isCollapsing) {
        for (const child of row.children) {
          result.push({
            transferType: `${row.transferType}-child-${child.id}`,
            isChild: true,
            collapsing: isCollapsing,
            name: child.name,
            credit: child.credit,
            debit: child.debit,
            transferCategory: child.transferCategory,
          });
        }
      }
    }
  }
  return result;
});

const tableData = computed(() => (loadingState.value ? skeletonRows : displayRows.value));

const fetchData = async () => {
  if (props.sellers.length === 0) return;
  loadingState.value = true;
  loadingBalances.value = true;
  financialMutations.value = [];
  startBalance.value = 0;
  endBalance.value = 0;

  const sellerPayoutPromises = props.sellers.map((s) =>
    ApiService.transfers.getTransferAggregate({
      fromDate: start.value,
      tillDate: end.value,
      fromId: s.id,
      category: 'sellerPayout',
    }),
  );

  const mainDataFetch = Promise.all([
    ApiService.transfers.getTransferSummary({
      fromDate: start.value,
      tillDate: end.value,
    }),
    Promise.all(sellerPayoutPromises),
  ])
    .then(([summaryRes, payoutRes]) => {
      const s = summaryRes.data;
      const amt = (field: { total?: { amount?: number } } | undefined) => (field?.total?.amount || 0) / 100;

      const tt = (key: string) => t(`modules.financial.financialOverview.transferTypes.${key}`);

      const payoutChildren = props.sellers
        .map((seller, i) => ({
          name: `${seller.firstName} ${seller.lastName}`,
          credit: 0,
          debit: (payoutRes[i]?.data.total?.amount || 0) / 100,
          id: seller.id,
        }))
        .filter((c) => c.debit !== 0);

      const categoryRows: FinancialOverviewTableRow[] = [
        { transferType: tt('deposits'), credit: amt(s.deposits), debit: 0, children: [], transferCategory: 'deposit' },
      ];

      if (payoutChildren.length > 0) {
        categoryRows.push({
          transferType: tt('sellerPayouts'),
          credit: 0,
          debit: payoutChildren.reduce((a, b) => a + b.debit, 0),
          children: payoutChildren,
          transferCategory: 'sellerPayout',
        });
      }

      categoryRows.push({ transferType: 'separator-1', credit: 0, debit: 0, isSeparator: true });

      categoryRows.push({
        transferType: tt('invoices'),
        credit: amt(s.invoices),
        debit: amt(s.creditInvoices),
        children: [
          { name: tt('invoices'), credit: amt(s.invoices), debit: 0, id: 'invoices', transferCategory: 'invoice' },
          {
            name: tt('creditInvoices'),
            credit: 0,
            debit: amt(s.creditInvoices),
            id: 'creditInvoices',
            transferCategory: 'creditInvoice',
          },
        ],
      });

      categoryRows.push({
        transferType: tt('fines'),
        credit: amt(s.waivedFines),
        debit: amt(s.fines),
        children: [
          { name: tt('fines'), credit: 0, debit: amt(s.fines), id: 'fines', transferCategory: 'fine' },
          {
            name: tt('waivedFines'),
            credit: amt(s.waivedFines),
            debit: 0,
            id: 'waivedFines',
            transferCategory: 'waivedFines',
          },
        ],
      });

      categoryRows.push({
        transferType: tt('adminCosts'),
        credit: 0,
        debit: amt(s.inactiveAdministrativeCosts),
        children: [],
        transferCategory: 'inactiveAdministrativeCost',
      });
      categoryRows.push({
        transferType: tt('writeOffs'),
        credit: amt(s.writeOffs),
        debit: 0,
        children: [],
        transferCategory: 'writeOff',
      });
      categoryRows.push({
        transferType: tt('payoutRequests'),
        credit: 0,
        debit: amt(s.payoutRequests),
        children: [],
        transferCategory: 'payoutRequest',
      });

      categoryRows.push({ transferType: 'separator-2', credit: 0, debit: 0, isSeparator: true });

      categoryRows.push({
        transferType: tt('manual'),
        credit: amt(s.manualCreations),
        debit: amt(s.manualDeletions),
        children: [
          {
            name: tt('manualCreations'),
            credit: amt(s.manualCreations),
            debit: 0,
            id: 'manualCreations',
            transferCategory: 'manualCreation',
          },
          {
            name: tt('manualDeletions'),
            credit: 0,
            debit: amt(s.manualDeletions),
            id: 'manualDeletions',
            transferCategory: 'manualDeletion',
          },
        ],
      });

      financialMutations.value = categoryRows;
    })
    .catch((error) => {
      handleError(error as AxiosError, toast);
    })
    .finally(() => {
      loadingState.value = false;
    });

  const balanceFetch = Promise.all([
    ApiService.balance.calculateTotalBalances({
      date: new Date(new Date(start.value).getTime() - 1).toISOString(),
      allowDeleted: true,
    }),
    ApiService.balance.calculateTotalBalances({
      date: new Date(new Date(end.value).getTime() - 1).toISOString(),
      allowDeleted: true,
    }),
  ])
    .then(([startBalRes, endBalRes]) => {
      const startData = startBalRes.data;
      const endData = endBalRes.data;
      startBalance.value = ((startData.totalPositive.amount || 0) + (startData.totalNegative.amount || 0)) / 100;
      endBalance.value = ((endData.totalPositive.amount || 0) + (endData.totalNegative.amount || 0)) / 100;
    })
    .catch((error) => {
      console.error('Error fetching balances:', error);
    })
    .finally(() => {
      loadingBalances.value = false;
    });

  await Promise.all([mainDataFetch, balanceFetch]);
};

watch(() => [props.year, props.sellers], fetchData, { immediate: true });
</script>

<style scoped lang="scss">
.expander-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: var(--p-text-color);
  transition: background 0.15s;

  &:hover {
    background: var(--p-content-hover-background);
  }

  i {
    font-size: 0.75rem;
    transition: transform 0.2s ease;
  }
}

:deep(.child-row) {
  animation: childRowIn 0.18s ease-out both;

  td:first-child {
    border-left: 3px solid var(--p-primary-color);
  }
}

:deep(.no-expander-row) {
  td:first-child {
    padding-left: calc(0.75rem + 1.75rem);
  }
}

:deep(.separator-row) {
  background: transparent !important;

  td {
    background: transparent !important;
  }

  &:hover td {
    background: transparent !important;
  }
}

@keyframes childRowIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes childRowOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-6px);
  }
}

:deep(.child-row-out) {
  animation: childRowOut 0.18s ease-out both;
}
</style>
