<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('c_invoiceInfo.Addressee')"
               :value="form.model.addressee.value.value"
               :attributes="form.model.addressee.attr.value"
               @update:value="form.context.setFieldValue('addressee', $event)"
               :errors="form.context.errors.value.addressee"
               id="name" placeholder="John & Co." type="text" :disabled="!edit"/>

    <InputSpan :label="t('c_invoiceInfo.Attention')"
               :value="form.model.attention?.value.value"
               :attributes="form.model.attention?.attr.value"
               @update:value="form.context.setFieldValue('attention', $event)"
               :errors="form.context.errors.value.attention"
               id="name" placeholder="John Doe" type="text" :disabled="!edit"/>

    <InputSpan :label="t('c_invoiceInfo.Street')"
               :value="form.model.street.value.value"
               :attributes="form.model.street.attr.value"
               @update:value="form.context.setFieldValue('street', $event)"
               :errors="form.context.errors.value.street"
               id="name" placeholder="Street" type="text" :disabled="!edit"/>

    <InputSpan :label="t('c_invoiceInfo.Postal code')"
               :value="form.model.postalCode.value.value"
               :attributes="form.model.postalCode.attr.value"
               @update:value="form.context.setFieldValue('postalCode', $event)"
               :errors="form.context.errors.value.postalCode"
               id="name" placeholder="Postal code" type="text" :disabled="!edit"/>

    <InputSpan :label="t('c_invoiceInfo.City')"
               :value="form.model.city.value.value"
               :attributes="form.model.city.attr.value"
               @update:value="form.context.setFieldValue('city', $event)"
               :errors="form.context.errors.value.city"
               id="name" placeholder="City" type="text" :disabled="!edit"/>

    <InputSpan :label="t('c_invoiceInfo.Country')"
               :value="form.model.country.value.value"
               :attributes="form.model.country.attr.value"
               @update:value="form.context.setFieldValue('country', $event)"
               :errors="form.context.errors.value.country"
               id="name" placeholder="Country" type="text" :disabled="!edit"/>
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { type PropType } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { type Form, setSubmit } from "@/utils/formUtils";
import { updateInvoiceAddressingObject } from "@/utils/validation-schema";
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
    type: Object as PropType<Form<yup.InferType<typeof updateInvoiceAddressingObject>>>,
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
      detail: values,
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
