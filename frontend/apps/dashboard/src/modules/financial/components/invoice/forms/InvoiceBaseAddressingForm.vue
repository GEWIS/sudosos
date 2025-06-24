<template>
  <div class="flex flex-col gap-2 justify-between">
    <InputSpan
      id="name"
      v-bind="form.model.addressee.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.addressee"
      :label="t('modules.financial.forms.invoice.addressee')"
      :placeholder="t('common.placeholders.addressee')"
      type="text"
      :value="form.model.addressee.value.value"
      @update:value="form.context.setFieldValue('addressee', $event)"
    />

    <InputSpan
      id="name"
      v-bind="form.model.attention?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.attention"
      :label="t('modules.financial.forms.invoice.attention')"
      :placeholder="t('common.placeholders.fullName')"
      type="text"
      :value="form.model.attention?.value.value"
      @update:value="form.context.setFieldValue('attention', $event)"
    />

    <InputSpan
      id="name"
      v-bind="form.model.street.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.street"
      :label="t('modules.financial.forms.invoice.street')"
      :placeholder="t('common.placeholders.street')"
      type="text"
      :value="form.model.street.value.value"
      @update:value="form.context.setFieldValue('street', $event)"
    />

    <InputSpan
      id="name"
      v-bind="form.model.postalCode.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.postalCode"
      :label="t('modules.financial.forms.invoice.postalCode')"
      :placeholder="t('common.placeholders.postalCode')"
      type="text"
      :value="form.model.postalCode.value.value"
      @update:value="form.context.setFieldValue('postalCode', $event)"
    />

    <InputSpan
      id="name"
      v-bind="form.model.city.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.city"
      :label="t('modules.financial.forms.invoice.city')"
      :placeholder="t('common.placeholders.city')"
      type="text"
      :value="form.model.city.value.value"
      @update:value="form.context.setFieldValue('city', $event)"
    />

    <InputSpan
      id="name"
      v-bind="form.model.country.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.country"
      :label="t('modules.financial.forms.invoice.country')"
      :placeholder="t('common.placeholders.country')"
      type="text"
      :value="form.model.country.value.value"
      @update:value="form.context.setFieldValue('country', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';
import * as yup from 'yup';
import type { Form } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import { updateInvoiceAddressingObject } from '@/utils/validation-schema';

const { t } = useI18n();

defineProps({
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
</script>

<style scoped lang="scss"></style>
