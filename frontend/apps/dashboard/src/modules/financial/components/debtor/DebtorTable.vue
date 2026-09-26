<template>
  <CardComponent class="w-full" :header="t('modules.financial.debtor.debtorUsers.header')">
    <DataTable
      filter-display="row"
      lazy
      removable-sort
      :sort-field="debtorStore.sort.field || undefined"
      :sort-order="debtorStore.sort.direction || undefined"
      striped-rows
      table-style="min-width: 50rem"
      :value="debtorRows"
      @sort="onSortClick"
    >
      <Column
        field="gewisId"
        :footer="t('common.total')"
        footer-class="font-bold"
        :header="t('common.gewisId')"
        style="width: 5%"
      >
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
        <template v-else #body="slotProps">
          <ExternalLink
            v-if="slotProps.data.gewisId"
            :text="slotProps.data.gewisId"
            :url="getGewisMemberUrl(slotProps.data.gewisId, locale)"
          />
        </template>
      </Column>

      <Column
        field="name"
        :footer="footerValue(t('modules.financial.debtor.debtorUsers.userCount', debtorStore.allDebtors.length))"
        footer-class="font-bold"
        :header="t('common.name')"
        :sortable="true"
        style="width: 10%"
      >
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
        <template v-else #body="{ data }">
          <UserLink new-tab :user="data.user" />
        </template>
        <template #filter>
          <InputText v-model="nameFilter" class="p-column-filter" placeholder="Search" type="text" />
        </template>
      </Column>

      <Column
        field="referenceBalance"
        :footer="footerValue(formatPrice(debtorStore.totalDebt))"
        footer-class="font-bold"
        :header="referenceBalanceHeader"
        :sortable="true"
        style="width: 15%"
      >
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
        <template v-else #body="{ data }">
          {{ data.referenceBalance }}
        </template>
      </Column>

      <Column
        class="font-bold"
        field="referenceBalanceFine"
        :header="t('modules.financial.debtor.debtorUsers.ofWhichFine')"
        :sortable="true"
        style="width: 10%"
      >
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
      </Column>

      <Column
        field="fine"
        :footer="footerValue(formatPrice(debtorStore.totalFine))"
        footer-class="font-bold"
        :header="t('modules.financial.debtor.debtorUsers.wasFined')"
        :sortable="true"
        style="width: 10%"
      >
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
      </Column>

      <Column
        field="fineSince"
        :header="t('modules.financial.debtor.debtorUsers.fineSince')"
        :sortable="true"
        style="width: 10%"
      >
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
        <template v-else #body="slotProps">
          <span v-if="slotProps.data.fineSince" class="font-bold text-red-500">
            {{ formatFineTimeSince(new Date(slotProps.data.fineSince), referenceBalanceDate) }}
          </span>
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, type ComputedRef, onMounted, ref, watch } from 'vue';
import { type DataTableSortEvent } from 'openvue/datatable';
import { debounce } from 'lodash';
import type { FineHandoutEventResponse } from '@gewis/sudosos-client';
import { formatDateTime, formatPrice, formatFineTimeSince } from '@/utils/formatterUtils';
import { useDebtorStore, SortField } from '@/stores/debtor.store';
import CardComponent from '@/components/CardComponent.vue';
import UserLink from '@/components/UserLink.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import { getGewisMemberUrl } from '@/utils/urlUtils';

const props = defineProps<{
  handoutEvent: FineHandoutEventResponse;
}>();

const { t, locale } = useI18n();

const debtorStore = useDebtorStore();

// Reference balance (the balance the fines were calculated from)
const referenceBalanceDate = new Date(props.handoutEvent.referenceDate);
const referenceBalanceHeader = t('modules.financial.debtor.debtorUsers.balanceOn', {
  date: formatDateTime(referenceBalanceDate),
});

// Totals in the footer row are meaningless until the debtors have loaded
function footerValue(value: string) {
  return debtorStore.isDebtorsLoading ? '' : value;
}

const nameFilter = ref<string>('');

watch(
  nameFilter,
  debounce(() => {
    debtorStore.filter = {
      name: nameFilter.value,
    };
  }, 50),
);

const onSortClick = (sort: DataTableSortEvent) => {
  debtorStore.sort = {
    field: (sort.sortField as SortField) || null,
    direction: sort.sortOrder || null,
  };
};

// Row in the datatable
interface DebtorRow {
  id: number;
  gewisId: number | undefined;
  name: string;
  referenceBalance: string;
  referenceBalanceFine: string;
  fine?: string;
}

// Convert data from the store to something that can be displayed by the datatable
const debtorRows: ComputedRef<DebtorRow[]> = computed(() => {
  if (debtorStore.isDebtorsLoading) {
    return new Array(10);
  }

  const debtorRowsArr = [];

  for (const debtor of debtorStore.debtors) {
    // Skip users that are not in this handout
    const handoutFine = props.handoutEvent.fines.find((f) => f.user.id === debtor.user.id);
    if (!handoutFine) continue;

    debtorRowsArr.push({
      id: debtor.user.id,
      gewisId: debtor.user.gewisId,
      user: debtor.user,
      referenceBalance: formatPrice(debtor.fine.balances[0].amount),
      referenceBalanceFine: debtor.fine.balances[0].fine && formatPrice(debtor.fine.balances[0].fine),
      fine: formatPrice(handoutFine.amount),
      fineSince: debtor.fine.balances[0].fineSince,
    });
  }

  return debtorRowsArr;
});

onMounted(() => {
  void debtorStore.fetchCalculatedFines(
    referenceBalanceDate,
    new Date(),
    props.handoutEvent.fines.map((f) => f.user.id),
  );
});
</script>
