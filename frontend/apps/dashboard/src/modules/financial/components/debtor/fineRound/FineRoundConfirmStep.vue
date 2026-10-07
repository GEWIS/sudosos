<template>
  <div>
    <!-- Taller than the select steps, which also show an info message above their table -->
    <DataTable scroll-height="32rem" scrollable striped-rows :value="[...fines, ...warnings]">
      <Column :header="t('common.gewisId')">
        <template #body="{ data }">
          <ExternalLink
            v-if="data.balances[0].memberId"
            :text="data.balances[0].memberId"
            :url="getGewisMemberUrl(data.balances[0].memberId, locale)"
          />
        </template>
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
    <p class="font-bold mt-2">
      {{ t('modules.financial.debtor.fineRound.summaryFines', { amount: formatPrice(fineTotal) }, fines.length) }}
      {{ t('modules.financial.debtor.fineRound.summaryWarnings', warnings.length) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { UserToFineResponse } from '@gewis/sudosos-client';
import { formatDateTime, formatPrice } from '@/utils/formatterUtils';
import { getGewisMemberUrl } from '@/utils/urlUtils';
import ExternalLink from '@/components/ExternalLink.vue';
import UserLink from '@/components/UserLink.vue';

const props = defineProps<{
  fines: UserToFineResponse[];
  warnings: UserToFineResponse[];
  measurementDate: Date;
}>();

const { t, locale } = useI18n();

const fineTotal = computed(() => ({
  amount: props.fines.reduce((sum, f) => sum + f.fineAmount.amount, 0),
  currency: 'EUR',
  precision: 2,
}));

const balanceHeader = computed(() =>
  t('modules.financial.debtor.debtorUsers.balanceOn', { date: formatDateTime(props.measurementDate) }),
);
</script>
