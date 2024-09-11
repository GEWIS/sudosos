<template>
  <DataTable
      :value="allRows"
      :pt="{
        tfoot: 'font-bold'
      }"
  >
    <Column field="amount" header="#" class="p-1">
      <template #body="entry">
        <span v-if="entry.index < totalRowCutoff">
        {{ entry.data.amount }}
        </span>
      </template>
    </Column>
    <Column field="description" :header="t('common.description')" class="p-1">
      <template #body="entry">
        <span v-if="entry.index < totalRowCutoff">
          {{ entry.data.description }}
        </span>
      </template>
    </Column>
    <Column
        field="priceInclVat"
        :header="t('common.price')"
        class="p-1"
    >
      <template #body="entry">
        <span v-if="entry.index < totalRowCutoff">
          {{ formatPrice(entry.data.priceInclVat) }}
        </span>
      </template>
    </Column>
    <Column field="vatPercentage" :header="t('common.vat')" class="p-1">
      <template #body="entry">
        <span v-if="entry.index < totalRowCutoff">
          {{ entry.data.vatPercentage +  '%' }}
        </span>
        <span v-else class="font-bold">
          {{ entry.data.description }}
        </span>
      </template>
    </Column>
    <Column
        field="totalPriceInclVat"
        :header="t('common.amount')"
        class="p-1"
    >
      <template #body="entry">
        <span :class="{ 'font-bold': entry.index >= totalRowCutoff }">
          {{ formatPrice(rowTotal(entry.data)) }}
        </span>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { formatPrice } from "@/utils/formatterUtils";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed, onMounted, type PropType, type Ref, ref } from "vue";
import type { InvoiceEntryResponse, InvoiceResponse } from "@sudosos/sudosos-client";
import type { DineroObject } from "dinero.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true,
  },
});

const exclVat: Ref<DineroObject> = ref({ amount: 0, precision: 2, currency: 'EUR' });
const vat: Ref<Record<number, DineroObject>> = ref({});
const inclVat: Ref<DineroObject> = ref({ amount: 0, precision: 2, currency: 'EUR' });
const totalRows: InvoiceEntryResponse[] = [];
const totalRowCutoff = computed(() => {
  return props.invoice.invoiceEntries.length - totalRows.length;
});
const allRows = ref(props.invoice.invoiceEntries);

const rowTotal = (row: any): DineroObject => {
  return {
    ...row.priceInclVat,
    amount: row.amount * row.priceInclVat.amount,
  };
};

onMounted(() => {
  props.invoice.invoiceEntries.forEach((entry) => {
    const price = entry.priceInclVat.amount * entry.amount;
    inclVat.value.amount += price;

    const excl = Math.round(price / (1 + (entry.vatPercentage / 100)));
    const vatAmount = price - excl;
    exclVat.value.amount += excl;

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
      priceInclVat: vat.value[key]
    });
  }

  if (props.invoice.transfer) {
    totalRows.push({
      description: t('common.incl'),
      amount: 1,
      vatPercentage: 0,
      priceInclVat: props.invoice.transfer.amountInclVat,
      custom: false,
    });
  }

  allRows.value.push(...totalRows);
});

</script>

<style scoped lang="scss">

</style>
