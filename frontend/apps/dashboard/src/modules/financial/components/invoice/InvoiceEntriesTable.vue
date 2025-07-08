<template>
  <DataTable
    :pt="{
      tfoot: 'font-bold',
    }"
    :value="allRows"
  >
    <Column class="p-1" field="amount" header="#">
      <template #body="entry">
        <span v-if="entry.index < totalRowCutoff">
          {{ entry.data.amount }}
        </span>
      </template>
    </Column>
    <Column class="p-1" field="description" :header="t('common.description')">
      <template #body="entry">
        <span v-if="entry.index < totalRowCutoff">
          {{ entry.data.description }}
        </span>
      </template>
    </Column>
    <Column class="p-1" field="priceInclVat" :header="t('common.price')">
      <template #body="entry">
        <span v-if="entry.index < totalRowCutoff">
          {{ formatPrice(entry.data.priceInclVat) }}
        </span>
      </template>
    </Column>
    <Column class="p-1" field="vatPercentage" :header="t('common.vat')">
      <template #body="entry">
        <span v-if="entry.index < totalRowCutoff">
          {{ entry.data.vatPercentage + '%' }}
        </span>
        <span v-else class="font-bold" :class="{ ...entry.data.class }">
          {{ entry.data.description }}
        </span>
      </template>
    </Column>
    <Column class="p-1" field="totalPriceInclVat" :header="t('common.amount')">
      <template #body="entry">
        <span :class="{ 'font-bold': entry.index >= totalRowCutoff, ...entry.data.class }">
          {{ formatPrice(rowTotal(entry.data)) }}
        </span>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { useInvoiceEntries } from '@/modules/financial/composables/useInvoiceEntries';
import { formatPrice } from 'sudosos-dashboard/src/utils/formatterUtils';

const { t } = useI18n();
const props = defineProps<{ invoice: InvoiceResponse }>();
const invoiceRef = computed(() => props.invoice);

const { allRows, totalRowCutoff, rowTotal } = useInvoiceEntries(invoiceRef);
</script>

<style scoped lang="scss"></style>
