<template>
  <FormCard
    v-if="invoice"
    :enable-edit="canEdit"
    :form="form"
    :header="t('modules.financial.invoice.transfer')"
    @cancel="form.context.resetForm"
    @save="formSubmit"
    @update:model-value="edit = $event"
  >
    <div class="flex flex-col gap-2 justify-between">
      <InvoiceAmountForm :edit="edit" :form="form" :invoice="invoice" @update:edit="edit = $event" />
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { updateInvoiceAmountObject } from '@/utils/validation-schema';
import { schemaToForm } from '@/utils/formUtils';
import InvoiceAmountForm from '@/modules/financial/components/invoice/forms/InvoiceAmountForm.vue';
import FormCard from '@/components/FormCard.vue';
import { useInvoiceCard } from '@/composables/invoiceCard';
import { useInvoiceForm } from '@/composables/invoiceForm';

const { t } = useI18n();
const props = defineProps<{ invoiceId: number }>();

const form = schemaToForm(updateInvoiceAmountObject);
const { invoice, canEdit, edit } = useInvoiceCard(props.invoiceId);

useInvoiceForm(invoice, form, (p) => {
  const a = p.transfer?.amountInclVat.amount;
  if (!a) return {};

  const amount = a / 100;
  return {
    amount,
  };
});

const formSubmit = () => {
  void form.submit();
};
</script>
