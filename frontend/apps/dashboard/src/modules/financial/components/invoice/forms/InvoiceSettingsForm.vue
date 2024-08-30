<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('c_invoiceInfo.Reference')"
               :value="form.model.reference.value.value"
               :attributes="form.model.reference.attr.value"
               @update:value="form.context.setFieldValue('reference', $event)"
               :errors="form.context.errors.value.reference"
               id="name" placeholder="BAC-2324-000" type="text" :disabled="!edit"/>

    <InputSpan :label="t('c_invoiceInfo.Date')"
               :value="form.model.date.value.value"
               :attributes="form.model.date.attr.value"
               @update:value="form.context.setFieldValue('date', $event)"
               :errors="form.context.errors.value.date"
               type="date" :disabled="!edit"/>

    <InputSpan :label="t('c_invoiceInfo.Description')"
               :value="form.model.description.value.value"
               :attributes="form.model.description.attr.value"
               @update:value="form.context.setFieldValue('description', $event)"
               :errors="form.context.errors.value.description"
               id="name" column type="textarea" :disabled="!edit"/>
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { type PropType } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { type Form, setSubmit } from "@/utils/formUtils";
import { updateInvoiceSettingsObject } from "@/utils/validation-schema";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { useInvoiceStore } from "@/stores/invoice.store";
import * as yup from "yup";
import { handleError } from "@/utils/errorUtils";

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['update:edit']);
const invoiceStore = useInvoiceStore();

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true
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

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  if (!props.form.context.meta.value.dirty) {
    emit('update:edit', false);
    return;
  }
  await invoiceStore.updateInvoice(props.invoice.id, values).then(() => {
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.invoiceUpdated'),
      life: 3000,
    });
    emit('update:edit', false);
  }).catch((error) => {
    handleError(error, toast);
  });
}));
</script>

<style scoped lang="scss">

</style>
