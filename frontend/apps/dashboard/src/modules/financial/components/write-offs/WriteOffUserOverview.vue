<template>
  <DataTable
    lazy
    :loading="isLoading"
    :paginator="true"
    :rows="rows"
    :rows-per-page-options="[5, 10, 25, 50, 100]"
    :sort-field="sortField"
    :sort-order="sortOrder"
    :total-records="totalRecords"
    :value="records"
    @page="onPage"
    @sort="onSort"
  >
    <Column field="firstName" :header="t('common.name')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-8" />
      </template>
      <template v-else #body="{ data }">
        <UserLink new-tab :user="data" />
      </template>
    </Column>

    <Column field="amount.amount" :header="t('modules.financial.invoice.account.balance')" :sortable="true">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="{ data }">
        <span class="text-right">{{ formatPrice(data.amount) }}</span>
      </template>
    </Column>

    <Column field="fine.amount" :header="t('modules.financial.write-offs.fine')" :sortable="true">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="{ data }">
        <span v-if="data.fine" class="text-right">{{ formatPrice(data.fine) }}</span>
      </template>
    </Column>

    <Column field="lastTransactionDate" :header="t('modules.financial.invoice.account.lastTransaction')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="{ data }">
        {{ formatDateFromString(data.lastTransactionDate) }}
      </template>
    </Column>

    <Column class="text-center" :header="t('common.actions')" style="width: 10%">
      <template #body="{ data }">
        <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
        <Button
          v-else
          v-tooltip.top="t('modules.financial.write-offs.create')"
          class="p-button-rounded p-button-text p-button-plain"
          icon="pi pi-ban"
          type="button"
          @click="() => openDialog(data)"
        />
      </template>
    </Column>
  </DataTable>
  <FormDialog
    v-model="showDialog"
    :confirm="true"
    :form="form"
    :header="t('modules.financial.write-offs.create')"
    :is-editable="true"
  >
    <template #form="slotProps">
      <WriteOffCreateForm :disabled="true" :form="slotProps.form" @submit:success="showDialog = false" />
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue';
import type { BalanceResponse } from '@sudosos/sudosos-client';
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import { formatDateFromString, formatPrice } from '@/utils/formatterUtils';
import { handleError } from '@/utils/errorUtils';
import { useWriteOffStore } from '@/stores/writeoff.store';
import UserLink from '@/components/UserLink.vue';
import WriteOffCreateForm from '@/modules/financial/components/write-offs/forms/WriteOffCreateForm.vue';
import FormDialog from '@/components/FormDialog.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createWriteOffSchema } from '@/utils/validation-schema';

const { t } = useI18n();
const writeOffStore = useWriteOffStore();

const isLoading = ref(true);
const records: Ref<BalanceResponse[]> = ref([]);
const toast = useToast();

const sortField = ref<string>('amount.amount');
const sortOrder = ref<number>(1); // 1 = asc, -1 = desc

async function onSort(event: DataTableSortEvent) {
  sortField.value = event.sortField as string;
  sortOrder.value = event.sortOrder || 0;
  await loadUsers();
}

const getSortField = (): string | undefined => {
  switch (sortField.value) {
    case 'amount.amount':
      return 'amount';
    case 'fine.amount':
      return 'fine';
  }
  return undefined;
};

const getSortOrder = (): string => {
  if (sortOrder.value === 1) return 'ASC';
  return 'DESC';
};

const loadUsers = async (): Promise<void> => {
  isLoading.value = true;
  const order = getSortOrder();
  const field = getSortField();
  await writeOffStore
    .fetchInactiveUsers(rows.value, page.value, field, order)
    .then((res) => {
      records.value = res;
    })
    .catch((err) => handleError(err, toast));
  isLoading.value = false;
};

onMounted(async () => {
  if (writeOffStore.getShouldRefresh) {
    isLoading.value = true;
    await loadUsers();
  } else {
    isLoading.value = false;
    records.value = writeOffStore.inactiveUsers;
  }
});

const rows = ref<number>(10);
const page = ref<number>(0);
const totalRecords = computed(() => writeOffStore.count);

async function onPage(event: DataTablePageEvent) {
  rows.value = event.rows;
  page.value = event.first;
  await loadUsers();
}

const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createWriteOffSchema);
type WithFullName = BalanceResponse & { fullName?: string };
const openDialog = (user: BalanceResponse) => {
  const u: WithFullName = { ...user } as WithFullName;
  u.fullName = `${user.firstName} ${user.lastName}`;
  form.context.setFieldValue('user', u);
  form.context.setFieldValue('balance', u.amount.amount);
  showDialog.value = true;
};
</script>

<style scoped></style>
