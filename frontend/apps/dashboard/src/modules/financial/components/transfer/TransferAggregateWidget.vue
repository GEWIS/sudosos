<template>
  <CardComponent :header="header">
    <div class="flex flex-col gap-1 text-sm">
      <div class="flex justify-between">
        <span class="text-muted-color">{{ t('modules.financial.transfer.widget.count') }}</span>
        <Skeleton v-if="loading" height="1rem" width="4rem" />
        <span v-else class="font-mono">{{ aggregateCount }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-muted-color">{{ t('modules.financial.transfer.widget.credit') }}</span>
        <Skeleton v-if="loading" height="1rem" width="5rem" />
        <span v-else class="font-mono">{{ isCredit ? formatDineroObject(aggregateTotal) : '—' }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-muted-color">{{ t('modules.financial.transfer.widget.debit') }}</span>
        <Skeleton v-if="loading" height="1rem" width="5rem" />
        <span v-else class="font-mono">{{ !isCredit ? formatDineroObject(aggregateTotal) : '—' }}</span>
      </div>

      <div class="flex justify-between font-semibold">
        <span class="text-muted-color">{{ t('modules.financial.transfer.widget.balance') }}</span>
        <Skeleton v-if="loading" height="1rem" width="5rem" />
        <span v-else class="font-mono">{{ formatDineroObject(aggregateTotal, !isCredit) }}</span>
      </div>

      <Divider />

      <div class="flex justify-between font-semibold">
        <span class="text-muted-color">{{
          t('modules.financial.transfer.widget.selected', { count: selectedRows.length })
        }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-muted-color">{{ t('modules.financial.transfer.widget.selectedAmount') }}</span>
        <span class="font-mono">{{ formatSelectedAmount(selectedTotal) }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-muted-color">{{ t('modules.financial.transfer.widget.remaining') }}</span>
        <span class="font-mono">{{ formatSelectedAmount(remainingTotal) }}</span>
      </div>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { DineroObjectResponse, TransferResponse } from '@gewis/sudosos-client';
import ApiService from '@/services/ApiService';
import CardComponent from '@/components/CardComponent.vue';
import { formatDineroObject } from '@/utils/formatterUtils';
import { isCreditCategory, transferCategoryPluralLabelKey } from '@/modules/financial/utils/transferCategories';

const props = defineProps<{
  category: string;
  fromDate: string;
  tillDate: string;
  selectedRows: TransferResponse[];
}>();

const { t } = useI18n();
const toast = useToast();

const loading = ref(false);
const aggregateCount = ref(0);
const aggregateTotal = ref<DineroObjectResponse>({ amount: 0, currency: 'EUR', precision: 2 });

const isCredit = computed(() => isCreditCategory(props.category));

const header = computed(() => {
  // The route guard the transfer view sits behind only ever lets a valid category through,
  // so labelKey is always defined here.
  const labelKey = transferCategoryPluralLabelKey(props.category)!;
  return t(labelKey);
});

const selectedTotal = computed(() => props.selectedRows.reduce((sum, r) => sum + r.amount.amount, 0));

const remainingTotal = computed(() => aggregateTotal.value.amount - selectedTotal.value);

function formatSelectedAmount(cents: number): string {
  return formatDineroObject({ amount: cents, currency: 'EUR', precision: 2 }, !isCredit.value && cents > 0);
}

let latestRequestId = 0;

async function fetchAggregate() {
  const requestId = ++latestRequestId;
  loading.value = true;
  try {
    const res = await ApiService.transfers.getTransferAggregate({
      fromDate: props.fromDate,
      tillDate: props.tillDate,
      category: props.category,
    });
    if (requestId !== latestRequestId) return; // a newer request already landed
    aggregateCount.value = res.data.count;
    aggregateTotal.value = res.data.total;
  } catch {
    if (requestId !== latestRequestId) return;
    toast.add({
      severity: 'error',
      summary: t('common.toast.error.error'),
      detail: t('modules.financial.transfer.widget.fetchError'),
      life: 3000,
    });
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

watch(() => [props.category, props.fromDate, props.tillDate], fetchAggregate, { immediate: true });
</script>
