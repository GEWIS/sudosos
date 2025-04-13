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
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { onMounted, type PropType, type Ref, ref } from 'vue';
import type { InvoiceEntryResponse, InvoiceResponse } from '@sudosos/sudosos-client';
import type { DineroObject } from 'dinero.js';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';
import { isDirty } from '@/utils/invoiceUtil';

const { t } = useI18n();

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true,
  },
});

type RowEntry = InvoiceEntryResponse & { class?: object };

const exclVat: Ref<DineroObject> = ref({ amount: 0, precision: 2, currency: 'EUR' });
const totalEntries: Ref<DineroObject> = ref({ amount: 0, precision: 2, currency: 'EUR' });
const vat: Ref<Record<number, DineroObject>> = ref({});
const inclVat: Ref<DineroObject> = ref({ amount: 0, precision: 2, currency: 'EUR' });
const totalRows: RowEntry[] = [];
const allRows: Ref<RowEntry[]> = ref([]);
const totalRowCutoff = ref(0);

const rowTotal = (row: RowEntry): DineroObject => {
  return {
    ...row.priceInclVat,
    amount: row.amount * row.priceInclVat.amount,
  } as DineroObject;
};

onMounted(() => {
  props.invoice.invoiceEntries.forEach((entry) => {
    allRows.value.push({
      description: entry.description,
      amount: entry.amount,
      vatPercentage: entry.vatPercentage,
      priceInclVat: entry.priceInclVat,
      custom: false,
    });
    const price = entry.priceInclVat.amount * entry.amount;
    inclVat.value.amount += price;

    const excl = Math.round(price / (1 + entry.vatPercentage / 100));
    const vatAmount = price - excl;
    exclVat.value.amount += excl;
    totalEntries.value.amount += price;

    if (entry.vatPercentage in vat.value) {
      vat.value[entry.vatPercentage].amount += vatAmount;
    } else {
      vat.value[entry.vatPercentage] = { amount: vatAmount, precision: 2, currency: 'EUR' };
    }
  });

  totalRows.push({
    description: t('common.excl'),
    amount: 1,
    vatPercentage: 0,
    priceInclVat: exclVat.value,
    custom: false,
  });

  for (const key in vat.value) {
    totalRows.push({
      description: t('common.vat', { vat: key }),
      amount: 1,
      custom: false,
      vatPercentage: Number(key),
      priceInclVat: vat.value[key],
    });
  }

  totalRows.push({
    description: t('common.incl'),
    amount: 1,
    vatPercentage: 0,
    priceInclVat: totalEntries.value,
    custom: false,
  });

  if (props.invoice.transfer && isDirty(props.invoice)) {
    totalRows.push({
      description: t('modules.financial.invoice.transfer'),
      amount: 1,
      vatPercentage: 0,
      class: { 'text-red-500': true },
      priceInclVat: props.invoice.transfer.amountInclVat,
      custom: false,
    });
  }

  totalRowCutoff.value = allRows.value.length;
  allRows.value.push(...totalRows);
});
</script>

<style scoped lang="scss"></style>
