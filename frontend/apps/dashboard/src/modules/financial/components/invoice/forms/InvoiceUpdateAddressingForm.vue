<template>
  <InvoiceBaseAddressingForm :edit="edit" :form="form" />
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import { type Form, setSubmit } from '@/utils/formUtils';
import { updateInvoiceAddressingObject } from '@/utils/validation-schema';
import { useInvoiceStore } from '@/stores/invoice.store';
import { handleError } from '@/utils/errorUtils';
import InvoiceBaseAddressingForm from '@/modules/financial/components/invoice/forms/InvoiceBaseAddressingForm.vue';

const { t } = useI18n();
const toast = useToast();
const invoiceStore = useInvoiceStore();

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateInvoiceAddressingObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits(['update:edit']);

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
          detail: values,
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
