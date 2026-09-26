<template>
  <div>
    <Message class="mb-4" severity="info">{{ info }}</Message>
    <DataTable
      v-model:selection="selection"
      data-key="id"
      scroll-height="25rem"
      scrollable
      striped-rows
      :value="debtors"
    >
      <Column selection-mode="multiple" style="width: 3rem" />
      <Column :header="t('common.gewisId')">
        <template #body="{ data }">{{ data.balances[0].memberId }}</template>
      </Column>
      <Column :header="t('common.name')">
        <template #body="{ data }">
          <UserLink new-tab :user="data.balances[0]" />
        </template>
      </Column>
      <!-- One column per date; the backend returns the balances in the same order as the dates -->
      <Column v-for="(date, i) in balanceDates" :key="date.getTime()" :header="balanceHeader(date)">
        <template #body="{ data }">{{ formatPrice(data.balances[i].amount) }}</template>
      </Column>
      <Column class="font-bold" :header="fineHeader">
        <template #body="{ data }">{{ formatPrice(data.fineAmount) }}</template>
      </Column>
    </DataTable>
    <p v-if="note" class="mt-2 text-sm">{{ note }}</p>
    <p class="font-bold mt-2">{{ summary }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { UserToFineResponse } from '@gewis/sudosos-client';
import { formatDateTime, formatPrice } from '@/utils/formatterUtils';
import UserLink from '@/components/UserLink.vue';

defineProps<{
  debtors: UserToFineResponse[];
  balanceDates: Date[];
  info: string;
  fineHeader: string;
  summary: string;
  note?: string;
}>();

const selection = defineModel<UserToFineResponse[]>('selection', { required: true });

const { t } = useI18n();

// Column header reading "Balance on <date>"
function balanceHeader(date: Date) {
  return t('modules.financial.debtor.debtorUsers.balanceOn', { date: formatDateTime(date) });
}
</script>
