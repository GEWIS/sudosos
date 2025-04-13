<template>
  <InvoiceBaseSettingsForm :edit="edit" :form="form" />
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import { type Form, setSubmit } from '@/utils/formUtils';
import { updateInvoiceSettingsObject } from '@/utils/validation-schema';
import { useInvoiceStore } from '@/stores/invoice.store';
import { handleError } from '@/utils/errorUtils';
import InvoiceBaseSettingsForm from '@/modules/financial/components/invoice/forms/InvoiceBaseSettingsForm.vue';

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['update:edit']);
const invoiceStore = useInvoiceStore();

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateInvoiceSettingsObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    if (!props.form.context.meta.value.dirty) {
      emit('update:edit', false);
      return;
    }
    invoiceStore
      .updateInvoice(props.invoice.id, values)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.invoiceUpdated'),
          life: 3000,
        });
        emit('update:edit', false);
      })
      .catch((error) => {
        handleError(error, toast);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
