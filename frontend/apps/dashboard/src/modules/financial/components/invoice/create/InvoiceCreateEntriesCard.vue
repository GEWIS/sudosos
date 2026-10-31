<template>
  <CardComponent :header="t('modules.financial.invoice.create.entries')">
    <div class="flex flex-col gap-3">
      <InvoiceEntriesTable :entries="entries" />
      <div class="flex flex-row justify-end">
        <InvoiceCreate :form="form" />
      </div>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';
import InvoiceEntriesTable from '@/modules/financial/components/invoice/InvoiceEntriesTable.vue';
import InvoiceCreate from '@/modules/financial/components/invoice/create/InvoiceCreate.vue';
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

<style scoped lang="scss"></style>
