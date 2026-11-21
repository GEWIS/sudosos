<template>
  <FormCard
    v-if="invoice"
    :enable-edit="canEdit"
    :form="form"
    :header="t('modules.financial.forms.invoice.details')"
    @save="save"
    @update:model-value="edit = $event"
  >
    <InvoiceBaseDetailsForm :edit="edit" :form="form" />
  </FormCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'openvue/usetoast';
import type { AxiosError } from 'axios';
import type { UpdateInvoiceRequest } from '@gewis/sudosos-client';
import FormCard from '@/components/FormCard.vue';
import InvoiceBaseDetailsForm from '@/modules/financial/components/invoice/forms/InvoiceBaseDetailsForm.vue';
import { updateInvoiceDetailsObject } from '@/utils/validation-schema';
import { schemaToForm } from '@/utils/formUtils';
import { useInvoiceCard } from '@/composables/invoiceCard';
import { useInvoiceForm } from '@/composables/invoiceForm';
import { useInvoiceStore } from '@/stores/invoice.store';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();
const invoiceStore = useInvoiceStore();
const props = defineProps<{ invoiceId: number }>();

const form = schemaToForm(updateInvoiceDetailsObject);
const { invoice, canEdit, edit } = useInvoiceCard(props.invoiceId);

// The date picker only reads YYYY-MM-DD, the backend sends an ISO timestamp.
function toLocalDate(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

useInvoiceForm(invoice, form, (p) => ({
  reference: p.reference,
  date: toLocalDate(p.date),
  description: p.description ?? '',
  addressee: p.addressee,
  attention: p.attention ?? '',
  street: p.street,
  postalCode: p.postalCode,
  city: p.city,
  country: p.country,
}));

const fields = Object.keys(updateInvoiceDetailsObject.fields) as Array<keyof typeof form.model>;

// Validate and send only the changed fields, so an old invalid value in an
// untouched field (e.g. an empty description) does not block other edits.
async function save(): Promise<boolean> {
  const changed = fields.filter((f) => form.context.isFieldDirty(f));
  const results = await Promise.all(changed.map((f) => form.context.validateField(f)));
  if (results.some((r) => !r.valid)) return false;

  const update: UpdateInvoiceRequest = Object.fromEntries(changed.map((f) => [f, form.context.values[f]]));
  try {
    await invoiceStore.updateInvoice(props.invoiceId, update);
  } catch (error) {
    handleError(error as AxiosError, toast);
    return false;
  }
  toast.add({
    severity: 'success',
    summary: t('common.toast.success.success'),
    detail: t('common.toast.success.invoiceUpdated'),
    life: 3000,
  });
  return true;
}
</script>
