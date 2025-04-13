<template>
  <div class="flex flex-column gap-2 justify-content-between">
    <InputSpan
      id="name"
      :attributes="form.model.reference.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.reference"
      :label="t('modules.financial.forms.invoice.reference')"
      placeholder="BAC-2324-000"
      type="text"
      :value="form.model.reference.value.value"
      @update:value="form.context.setFieldValue('reference', $event)"
    />

    <InputSpan
      :attributes="form.model.date.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.date"
      :label="t('common.date')"
      type="date"
      :value="form.model.date.value.value"
      @update:value="form.context.setFieldValue('date', $event)"
    />

    <InputSpan
      id="name"
      :attributes="form.model.description.attr.value"
      column
      :disabled="!edit"
      :errors="form.context.errors.value.description"
      :label="t('common.description')"
      type="textarea"
      :value="form.model.description.value.value"
      @update:value="form.context.setFieldValue('description', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';
import * as yup from 'yup';
import type { Form } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import { updateInvoiceSettingsObject } from '@/utils/validation-schema';

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

<style scoped lang="scss"></style>
