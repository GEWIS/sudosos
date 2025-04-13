<template>
  <CardComponent class="w-full" :header="t('modules.financial.debtor.debtorUsers.header')">
    <div v-if="isEditable" class="mb-2">
      {{ t('modules.financial.debtor.debtorUsers.explanation') }}
    </div>
    <DataTable
      v-model:selection="selectedUsers"
      filter-display="row"
      lazy
      removable-sort
      :row-class="(data) => (!data?.canGoInDebt ? 'font-italic' : '')"
      :sort-field="debtorStore.sort.field || undefined"
      :sort-order="debtorStore.sort.direction || undefined"
      striped-rows
      table-style="min-width: 50rem"
      :value="debtorRows"
      @sort="onSortClick"
    >
      <Column v-if="isEditable" selection-mode="multiple" style="width: 2%"> </Column>

      <Column field="gewisId" :header="t('common.gewisId')" style="width: 5%">
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
      </Column>

      <Column field="name" :header="t('common.name')" :sortable="true" style="width: 10%">
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
        v-if="isEditable"
        field="controlBalance"
        filter-match-mode="notEquals"
        :header="controlBalanceHeader"
        :show-filter-menu="false"
        :sortable="true"
        style="width: 15%"
      >
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
        <template v-else #body="{ data }">
          {{ data.controlBalance }}
        </template>
        <template v-if="isEditable" #filter>
          <Calendar
            id="firstDate"
            v-model="controlBalanceDate"
            hour-format="24"
            placeholder="Click to change date"
            show-time
          />
        </template>
      </Column>

      <Column
        field="referenceBalance"
        filter-match-mode="notEquals"
        :header="referenceBalanceHeader"
        :show-filter-menu="false"
        :sortable="true"
        style="width: 15%"
      >
        <template v-if="debtorStore.isDebtorsLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
        <template v-else #body="{ data }">
          {{ data.referenceBalance }}
        </template>
        <template v-if="isEditable" #filter>
          <Calendar
            id="firstDate"
            v-model="referenceBalanceDate"
            hour-format="24"
            placeholder="Click to change date"
            show-time
          />
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

      <Column field="fine" :header="fineHeader" :sortable="true" style="width: 10%">
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
            {{ formatFineTimeSince(new Date(slotProps.data.fineSince), referenceBalanceDate || nowDate) }}
          </span>
        </template>
      </Column>
    </DataTable>
    <Divider />
    <div class="flex flex-row justify-content-between">
      <table>
        <thead>
          <tr>
            <th />
            <th class="text-left">{{ t('common.total') + ':' }}</th>
            <th v-if="isEditable" class="text-left">{{ t('common.selected') + ':' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ t('common.users') + ':' }}</td>
            <td>
              <template v-if="debtorStore.isDebtorsLoading"><Skeleton class="mb-2" width="5rem" /></template>
              <template v-else>{{ debtorStore.allDebtors.length }}</template>
            </td>
            <td v-if="isEditable">
              <template v-if="debtorStore.isDebtorsLoading"><Skeleton class="mb-2" width="5rem" /></template>
              <template v-else>{{ selectedUsers.length }}</template>
            </td>
          </tr>
          <tr>
            <td>{{ t('modules.financial.debtor.debtorUsers.sumCurrentBalance') + ':' }}</td>
            <td>
              <template v-if="debtorStore.isDebtorsLoading"><Skeleton class="mb-2" width="5rem" /></template>
              <template v-else>{{ formatPrice(debtorStore.totalDebt) }}</template>
            </td>
            <td v-if="isEditable">
              <template v-if="debtorStore.isDebtorsLoading"><Skeleton class="mb-2" width="5rem" /></template>
              <template v-else>{{ formatPrice(selectedTotalDebt) }}</template>
            </td>
          </tr>
          <tr>
            <td>
              {{
                isEditable
                  ? t('modules.financial.debtor.debtorUsers.sumToBeFined')
                  : t('modules.financial.debtor.debtorUsers.sumWasFined') + ':'
              }}
            </td>
            <td>
              <template v-if="debtorStore.isDebtorsLoading"><Skeleton class="mb-2" width="5rem" /></template>
              <template v-else>{{ formatPrice(debtorStore.totalFine) }}</template>
            </td>
            <td v-if="isEditable">
              <template v-if="debtorStore.isDebtorsLoading"><Skeleton class="mb-2" width="5rem" /></template>
              <template v-else>{{ formatPrice(selectedTotalFine) }}</template>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="isEditable && isAllowed('update', ['all'], 'Fine', ['any'])" class="grid w-20rem">
        <div class="col-6">
          <Button
            class="flex flex-row h-full items-center justify-center justify-content-center w-full"
            :disabled="debtorStore.isDebtorsLoading || debtorStore.isNotifyLoading || selectedUsers.length === 0"
            outlined
            @click="startNotify"
          >
            <span v-if="!debtorStore.isNotifyLoading">
              {{ t('modules.financial.debtor.debtorUsers.notify') }}
            </span>

            <ProgressSpinner v-else class="h-1rem w-1rem" stroke-width="10" />
          </Button>
        </div>
        <div class="col-6">
          <Button
            class="flex flex-row h-full items-center justify-center justify-content-center w-full"
            :disabled="debtorStore.isDebtorsLoading || debtorStore.isHandoutLoading || selectedUsers.length === 0"
            @click="startHandout"
          >
            <span v-if="!debtorStore.isHandoutLoading">
              {{ t('modules.financial.debtor.debtorUsers.handout') }}
            </span>

            <ProgressSpinner v-else class="h-1rem w-1rem" stroke-width="10" />
          </Button>
        </div>
        <Divider class="col-12 my-0" />
        <div class="col-12">
          <Button
            class="flex flex-row h-full items-center justify-center justify-content-center w-full"
            :disabled="debtorStore.isDebtorsLoading || debtorStore.isLockLoading || selectedUsers.length === 0"
            severity="contrast"
            @click="startCannotInDebt"
          >
            <span v-if="!debtorStore.isLockLoading">
              {{ t('modules.financial.debtor.debtorUsers.cannotDebt') }}
            </span>

            <ProgressSpinner v-else class="h-1rem w-1rem" stroke-width="10" />
          </Button>
        </div>
      </div>
    </div>
  </CardComponent>
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, type ComputedRef, onMounted, ref, watch } from 'vue';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import Skeleton from 'primevue/skeleton';
import { debounce } from 'lodash';
import type { FineHandoutEventResponse } from '@sudosos/sudosos-client';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { isAllowed } from '@/utils/permissionUtils';
import { formatPrice, formatFineTimeSince } from '@/utils/formatterUtils';
import { useDebtorStore, SortField, type Debtor } from '@/stores/debtor.store';
import CardComponent from '@/components/CardComponent.vue';
import UserLink from '@/components/UserLink.vue';
import { handleError } from '@/utils/errorUtils';

const props = defineProps<{
  handoutEvent?: FineHandoutEventResponse;
}>();

const isEditable = computed(() => {
  return props.handoutEvent == undefined;
});

const { t } = useI18n();

const debtorStore = useDebtorStore();

const confirm = useConfirm();

const toast = useToast();

// All the users that have been selected for actions
const selectedUsers = ref<DebtorRow[]>([]);

/**
 * Fix the nowDate so it is consequent between all function calls
 */
const nowDate = new Date();

// Reference balance (for calculating the fine)
const referenceBalanceDate = ref<Date | undefined>(
  isEditable.value ? undefined : new Date(props.handoutEvent!.referenceDate),
);
const referenceBalanceHeader = computed(() => {
  if (!isEditable.value)
    return t('modules.financial.debtor.debtorUsers.balanceOn', {
      date: referenceBalanceDate.value!.toLocaleString('nl', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    });

  if (referenceBalanceDate.value == undefined) {
    return (
      t('modules.financial.debtor.debtorUsers.currentBalance') +
      ' (' +
      t('modules.financial.debtor.debtorUsers.target') +
      ')'
    );
  } else {
    return (
      t('modules.financial.debtor.debtorUsers.balanceOn', {
        date: referenceBalanceDate.value.toLocaleString('nl', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      }) +
      ' (' +
      t('modules.financial.debtor.debtorUsers.target') +
      ')'
    );
  }
});

// Control balance (for checking if they are still negative, usually current balance)
const controlBalanceDate = ref<Date>();
const controlBalanceHeader = computed(() => {
  if (controlBalanceDate.value == undefined) {
    return (
      t('modules.financial.debtor.debtorUsers.currentBalance') +
      ' (' +
      t('modules.financial.debtor.debtorUsers.control') +
      ')'
    );
  } else {
    return (
      t('modules.financial.debtor.debtorUsers.balanceOn', {
        date: controlBalanceDate.value.toLocaleString('nl', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      }) +
      ' (' +
      t('modules.financial.debtor.debtorUsers.control') +
      ')'
    );
  }
});

// Fetch new calculated fines based on the dates
watch([referenceBalanceDate, controlBalanceDate], updateCalculatedFines);
async function updateCalculatedFines() {
  selectedUsers.value = [];
  await debtorStore.fetchCalculatedFines(
    referenceBalanceDate.value || nowDate,
    controlBalanceDate.value || nowDate,
    props.handoutEvent?.fines.map((f) => f.user.id),
  );
}

const fineHeader = computed(() => {
  if (isEditable.value) {
    return t('modules.financial.debtor.debtorUsers.toBeFined');
  } else {
    return t('modules.financial.debtor.debtorUsers.wasFined');
  }
});

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
  if (sort.sortField == SortField.CONTROL_BALANCE && controlBalanceDate.value == undefined) {
    return;
  }

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
  controlBalance: string;
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
    // Skip if we are viewing a handoutEvent but user is not in that handout
    if (props.handoutEvent && !props.handoutEvent.fines.map((f) => f.user.id).includes(debtor.user.id)) {
      continue;
    }

    // Take fine from handout event if present
    let fine;
    if (props.handoutEvent) {
      fine = formatPrice(props.handoutEvent.fines.find((f) => f.user.id === debtor.user.id)!.amount);
    } else {
      fine = debtor.fine.fineAmount && formatPrice(debtor.fine.fineAmount);
    }

    debtorRowsArr.push({
      id: debtor.user.id,
      gewisId: debtor.user.gewisId,
      user: debtor.user,
      referenceBalance: formatPrice(debtor.fine.balances[0].amount),
      controlBalance: debtor.fine.balances[1] && formatPrice(debtor.fine.balances[1].amount),
      referenceBalanceFine: debtor.fine.balances[0].fine && formatPrice(debtor.fine.balances[0].fine),
      fine: fine,
      fineSince: debtor.fine.balances[0].fineSince,
      canGoInDebt: debtor.user.canGoIntoDebt,
    });
  }

  return debtorRowsArr;
});

const selectedTotalDebt = computed(() => {
  return {
    amount:
      selectedUsers.value
        ?.map((r) => debtorStore.allDebtors.find((d) => d.user.id === r.id)!)
        .reduce((accumulator: number, current: Debtor) => {
          return accumulator + current.fine.balances[0].amount.amount;
        }, 0) || 0,
    currency: 'EUR',
    precision: 2,
  };
});

const selectedTotalFine = computed(() => {
  return {
    amount:
      selectedUsers.value
        .map((r) => debtorStore.allDebtors.find((d) => d.user.id === r.id)!)
        .reduce((accumulator: number, current: Debtor) => {
          return accumulator + current.fine.fineAmount.amount;
        }, 0) || 0,
    currency: 'EUR',
    precision: 2,
  };
});

function startNotify() {
  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.debtor.debtorUsers.confirm.notifyMessage', { count: selectedUsers.value.length }),
    icon: 'pi pi-question-circle',
    acceptLabel: t('modules.financial.debtor.debtorUsers.notify'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      debtorStore
        .notifyFines(
          selectedUsers.value.map((s) => s.id),
          referenceBalanceDate.value || nowDate,
        )
        .then(() => {
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.finesNotified'),
            life: 3000,
            severity: 'success',
          });
        })
        .catch((err) => {
          handleError(err, toast);
        });
    },
  });
}

function startHandout() {
  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.debtor.debtorUsers.confirm.handoutMessage', { count: selectedUsers.value.length }),
    icon: 'pi pi-question-circle',
    acceptLabel: t('modules.financial.debtor.debtorUsers.handout'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      debtorStore
        .handoutFines(
          selectedUsers.value.map((s) => s.id),
          referenceBalanceDate.value || nowDate,
        )
        .then(() => {
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.finesHandedOut'),
            life: 3000,
            severity: 'success',
          });
        })
        .catch((err) => {
          handleError(err, toast);
        });
    },
  });
}

function startCannotInDebt() {
  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.debtor.debtorUsers.confirm.cannotGoInDebt', { count: selectedUsers.value.length }),
    icon: 'pi pi-question-circle',
    acceptLabel: t('common.confirm'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      debtorStore
        .cannotGoIntoDebt(selectedUsers.value.map((s) => s.id))
        .then(() => {
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.finesCannotGoIntoDebt'),
            life: 3000,
            severity: 'success',
          });
        })
        .catch((err) => {
          handleError(err, toast);
        });
    },
  });
}

onMounted(() => {
  void updateCalculatedFines();
});
</script>

<style scoped lang="scss">
th,
td {
  padding: 0 0.5rem;
}
</style>
