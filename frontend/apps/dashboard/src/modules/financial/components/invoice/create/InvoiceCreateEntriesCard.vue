<template>
  <CardComponent class="entries-card" :header="t('modules.financial.invoice.create.entries')">
    <InvoiceEntriesTable :entries="entries" scrollable />
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';
import InvoiceEntriesTable from '@/modules/financial/components/invoice/InvoiceEntriesTable.vue';
import { createInvoiceObject } from '@/utils/validation-schema';
import { type Form, getProperty } from '@/utils/formUtils';
import { transactionsToInvoiceEntries } from '@/utils/invoiceUtil';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const entries = computed(() => transactionsToInvoiceEntries(getProperty(props.form, 'transactions') ?? []));
</script>

<style scoped lang="scss">
// When the parent bounds the card's height, the card content shrinks to fit and the
// table (scroll-height="flex") scrolls its lines, keeping the header and totals in view.
.entries-card {
  display: flex;
  flex-direction: column;
}

.entries-card :deep(.p-card-body) {
  flex: 1;
  min-height: 0;
}

.entries-card :deep(.p-card-content) {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
