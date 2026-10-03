<template>
  <div>
    <p class="mb-4">
      {{
        t('modules.financial.debtor.fineRound.summary', {
          fined: fines.length,
          amount: formatPrice(fineTotal),
          warned: warnings.length,
        })
      }}
    </p>
    <DataTable scroll-height="25rem" scrollable striped-rows :value="[...fines, ...warnings]">
      <Column :header="t('common.gewisId')">
        <template #body="{ data }">{{ data.balances[0].memberId }}</template>
      </Column>
      <Column :header="t('common.name')">
        <template #body="{ data }">
          <UserLink new-tab :user="data.balances[0]" />
        </template>
      </Column>
      <Column :header="balanceHeader">
        <template #body="{ data }">{{ formatPrice(data.balances[0].amount) }}</template>
      </Column>
      <Column :header="t('modules.financial.debtor.fineRound.outcome')">
        <template #body="{ data }">
          <span v-if="fines.includes(data)" class="font-bold text-red-500">
            {{ t('modules.financial.debtor.fineRound.outcomeFine', { amount: formatPrice(data.fineAmount) }) }}
          </span>
          <span v-else>{{ t('modules.financial.debtor.fineRound.outcomeWarning') }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { UserToFineResponse } from '@gewis/sudosos-client';
import { formatDateTime, formatPrice } from '@/utils/formatterUtils';
import UserLink from '@/components/UserLink.vue';

const props = defineProps<{
  fines: UserToFineResponse[];
  warnings: UserToFineResponse[];
  measurementDate: Date;
}>();

const { t } = useI18n();

const fineTotal = computed(() => ({
  amount: props.fines.reduce((sum, f) => sum + f.fineAmount.amount, 0),
  currency: 'EUR',
  precision: 2,
}));

const balanceHeader = computed(() =>
  t('modules.financial.debtor.debtorUsers.balanceOn', { date: formatDateTime(props.measurementDate) }),
);
</script>
