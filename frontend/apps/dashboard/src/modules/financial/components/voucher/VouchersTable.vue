<template>
  <EntityTable
    v-model:search="search"
    :create-label="canCreate ? t('common.create') : undefined"
    :is-loading="isLoading"
    :records="records"
    :rows="rows"
    :title="t('modules.financial.vouchers.list.header')"
    :total-records="totalRecords"
    :use-years="false"
    @create="openCreateDialog"
    @page="onPage"
    @search="searchById"
  >
    <template #columns="{ isLoading: loading }">
      <Column field="id" :header="t('common.id')" style="width: 4rem">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-4" />
          <span v-else>{{ data.id }}</span>
        </template>
      </Column>

      <Column field="name" :header="t('modules.financial.vouchers.list.name')">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-8" />
          <AppLink
            v-else
            class="font-medium"
            :text="data.name"
            :to="{ name: 'voucherDetail', params: { id: data.id } }"
          />
        </template>
      </Column>

      <Column :header="t('modules.financial.vouchers.list.period')">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else class="text-sm">
            {{ `${formatDateFromString(data.activeStartDate)} — ${formatDateFromString(data.activeEndDate)}` }}
          </span>
        </template>
      </Column>

      <Column :header="t('modules.financial.vouchers.list.status')">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-4" />
          <Badge v-else :severity="getStatusSeverity(data)" :value="getStatusLabel(data)" />
        </template>
      </Column>

      <Column field="amount" :header="t('modules.financial.vouchers.list.cards')" style="text-align: right">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-3 ml-auto" />
          <span v-else>{{ data.amount }}</span>
        </template>
      </Column>

      <Column :header="t('modules.financial.vouchers.list.cardBalance')" style="text-align: right">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-4 ml-auto" />
          <span v-else>{{ formatDineroObject(data.balance) }}</span>
        </template>
      </Column>

      <Column :header="t('modules.financial.vouchers.list.totalBalance')" style="text-align: right">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-4 ml-auto" />
          <span v-else>{{ formatTotalBalance(data) }}</span>
        </template>
      </Column>

      <Column :header="t('modules.financial.vouchers.list.actions')" style="width: 8rem; text-align: center">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-2rem my-1 surface-300 w-6 mx-auto" />
          <div v-else class="flex justify-center gap-1">
            <Button
              v-tooltip.top="t('modules.financial.vouchers.list.viewDetails')"
              icon="pi pi-eye"
              rounded
              size="small"
              text
              @click="navigateToDetail(data.id)"
            />
            <Button
              v-if="canEdit(data)"
              v-tooltip.top="t('common.edit')"
              icon="pi pi-pencil"
              rounded
              size="small"
              text
              @click="openEditDialog(data)"
            />
          </div>
        </template>
      </Column>
    </template>
  </EntityTable>

  <VoucherGroupDialog v-model:visible="isDialogOpen" :voucher-group="selectedGroup" @saved="handleSaved" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import type { VoucherGroupResponse } from '@gewis/sudosos-client';
import EntityTable from '@/components/EntityTable.vue';
import AppLink from '@/components/AppLink.vue';
import VoucherGroupDialog from '@/modules/financial/components/voucher/VoucherGroupDialog.vue';
import { useVoucherGroupStore } from '@/stores/voucherGroup.store';
import { useEntityTable } from '@/composables/useEntityTable';
import { formatDineroObject, formatDateFromString, formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();
const router = useRouter();
const voucherGroupStore = useVoucherGroupStore();

const isDialogOpen = ref(false);
const selectedGroup = ref<VoucherGroupResponse | null>(null);

async function fetchVoucherGroups({
  page,
  rows,
}: {
  year: number;
  page: number;
  rows: number;
  filters: Record<string, unknown>;
}) {
  return voucherGroupStore.fetchVoucherGroups(rows, page);
}

async function fetchSingleVoucherGroup(id: number) {
  return voucherGroupStore.fetchVoucherGroupById(id);
}

const { search, rows, isLoading, records, totalRecords, onPage, searchById, reload } = useEntityTable<
  VoucherGroupResponse,
  Record<string, unknown>
>(fetchVoucherGroups, fetchSingleVoucherGroup, {
  defaultRows: 10,
  useYears: false,
});

const canCreate = computed(() => isAllowed('create', ['all'], 'VoucherGroup', ['*']));

const getStatus = (group?: VoucherGroupResponse): 'upcoming' | 'active' | 'expired' => {
  if (!group) return 'upcoming';
  const now = new Date();
  const start = group.activeStartDate ? new Date(group.activeStartDate) : new Date(0);
  const end = new Date(group.activeEndDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'expired';
  return 'active';
};

const getStatusSeverity = (group?: VoucherGroupResponse): 'info' | 'success' | 'secondary' => {
  const status = getStatus(group);
  if (status === 'active') return 'success';
  if (status === 'upcoming') return 'info';
  return 'secondary';
};

const getStatusLabel = (group?: VoucherGroupResponse): string => {
  const status = getStatus(group);
  return t(`modules.financial.vouchers.status.${status}`);
};

const formatTotalBalance = (group?: VoucherGroupResponse): string => {
  if (!group) return '';
  const totalCents = (group.balance?.amount || 0) * (group.amount || 0);
  return formatPrice({
    amount: totalCents,
    currency: group.balance?.currency || 'EUR',
    precision: group.balance?.precision ?? 2,
  });
};

const canEdit = (group?: VoucherGroupResponse): boolean => {
  if (!group) return false;
  if (!isAllowed('update', ['all'], 'VoucherGroup', ['*'])) return false;
  if (!group.activeStartDate) return false;
  return new Date(group.activeStartDate) > new Date();
};

const openCreateDialog = () => {
  selectedGroup.value = null;
  isDialogOpen.value = true;
};

const openEditDialog = (group: VoucherGroupResponse) => {
  selectedGroup.value = group;
  isDialogOpen.value = true;
};

const navigateToDetail = (id: number) => {
  void router.push({ name: 'voucherDetail', params: { id } });
};

const handleSaved = async () => {
  await reload();
};
</script>
