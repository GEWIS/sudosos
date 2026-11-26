<template>
  <FormCard :enable-edit="false" :header="t('modules.financial.forms.invoice.details')">
    <InvoiceBaseDetailsForm :edit="edit" :form="form" />
  </FormCard>
</template>

<script setup lang="ts">
/**
 * Combined settings (reference, date, description) and addressing fields for a new invoice.
 * Fields stay disabled until a user is selected, since selecting one fills in the address,
 * and on the summary step (`disabled`).
 */

import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import FormCard from '@/components/FormCard.vue';
import { createInvoiceObject } from '@/utils/validation-schema';
import { type Form, getProperty } from '@/utils/formUtils';
import InvoiceBaseDetailsForm from '@/modules/financial/components/invoice/forms/InvoiceBaseDetailsForm.vue';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const edit = computed(() => !props.disabled && getProperty(props.form, 'forId') !== undefined);
</script>

<style scoped lang="scss"></style>
