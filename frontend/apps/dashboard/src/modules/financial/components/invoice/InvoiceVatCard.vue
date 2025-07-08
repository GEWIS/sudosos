<template>
  <CardComponent class="w-full" :header="t('modules.financial.invoice.vat.title')">
    <DataTable :value="vatEntries">
      <Column field="vatPercentage" :header="t('modules.financial.invoice.vat.percentage')" />
      <Column :header="t('modules.financial.invoice.vat.baseExclVat')">
        <template #body="{ data }">
          {{ formatPrice(data.baseAmount) }}
        </template>
      </Column>
      <Column :header="t('modules.financial.invoice.vat.inclVat')">
        <template #body="{ data }">
          {{ formatPrice(data.amountInclVat) }}
        </template>
      </Column>
      <Column :header="t('modules.financial.invoice.vat.vat')">
        <template #body="{ data }">
          {{ formatPrice(data.vatAmount) }}
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useInvoiceEntries } from '@/modules/financial/composables/useInvoiceEntries';
import CardComponent from '@/components/CardComponent.vue';
import { formatPrice } from 'sudosos-dashboard/src/utils/formatterUtils';
import { useInvoiceCard } from '@/composables/invoiceCard';

const { t } = useI18n();
const props = defineProps<{ invoiceId: number }>();

const { invoice } = useInvoiceCard(props.invoiceId);
const { vatEntries } = useInvoiceEntries(invoice);
</script>

<style scoped lang="scss"></style>
