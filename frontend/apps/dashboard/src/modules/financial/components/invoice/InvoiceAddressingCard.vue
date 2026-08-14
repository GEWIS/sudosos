<template>
  <FormCard
    v-if="invoice"
    :enable-edit="canEdit"
    :form="form"
    :header="t('modules.financial.forms.invoice.addressing')"
    @cancel="form.context.resetForm"
    @save="formSubmit"
    @update:model-value="edit = $event"
  >
    <div class="flex flex-col gap-2 justify-between">
      <InvoiceAddressingForm :edit="edit" :form="form" :invoice="invoice" @update:edit="edit = $event" />
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import FormCard from '@/components/FormCard.vue';
import InvoiceAddressingForm from '@/modules/financial/components/invoice/forms/InvoiceUpdateAddressingForm.vue';
import { updateInvoiceAddressingObject } from '@/utils/validation-schema';
import { schemaToForm } from '@/utils/formUtils';
import { useInvoiceCard } from '@/composables/invoiceCard';
import { useInvoiceForm } from '@/composables/invoiceForm';

const { t } = useI18n();
const props = defineProps<{ invoiceId: number }>();

const form = schemaToForm(updateInvoiceAddressingObject);
const { invoice, canEdit, edit } = useInvoiceCard(props.invoiceId);

useInvoiceForm(invoice, form, (p) => ({
  addressee: p.addressee,
  attention: p.attention,
  street: p.street,
  postalCode: p.postalCode,
  city: p.city,
  country: p.country,
}));

const formSubmit = () => {
  void form.submit();
};
</script>

<style scoped lang="scss"></style>
