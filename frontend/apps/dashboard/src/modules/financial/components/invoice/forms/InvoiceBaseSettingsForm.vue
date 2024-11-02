<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('modules.financial.forms.invoice.reference')"
               :value="form.model.reference.value.value"
               :attributes="form.model.reference.attr.value"
               @update:value="form.context.setFieldValue('reference', $event)"
               :errors="form.context.errors.value.reference"
               id="name" placeholder="BAC-2324-000" type="text" :disabled="!edit"/>

    <InputSpan :label="t('common.date')"
               :value="form.model.date.value.value"
               :attributes="form.model.date.attr.value"
               @update:value="form.context.setFieldValue('date', $event)"
               :errors="form.context.errors.value.date"
               type="date" :disabled="!edit"/>

    <InputSpan :label="t('common.description')"
               :value="form.model.description.value.value"
               :attributes="form.model.description.attr.value"
               @update:value="form.context.setFieldValue('description', $event)"
               :errors="form.context.errors.value.description"
               id="name" column type="textarea" :disabled="!edit"/>
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import type { Form } from "@/utils/formUtils";
import * as yup from "yup";
import { updateInvoiceSettingsObject } from "@/utils/validation-schema";

const { t } = useI18n();

defineProps({
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
</script>

<style scoped lang="scss">

</style>