<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('modules.financial.forms.invoice.addressee')"
               :value="form.model.addressee.value.value"
               :attributes="form.model.addressee.attr.value"
               @update:value="form.context.setFieldValue('addressee', $event)"
               :errors="form.context.errors.value.addressee"
               id="name" :placeholder="t('common.placeholders.addressee')" type="text" :disabled="!edit"/>

    <InputSpan :label="t('modules.financial.forms.invoice.attention')"
               :value="form.model.attention?.value.value"
               :attributes="form.model.attention?.attr.value"
               @update:value="form.context.setFieldValue('attention', $event)"
               :errors="form.context.errors.value.attention"
               id="name" :placeholder="t('common.placeholders.fullName')" type="text" :disabled="!edit"/>

    <InputSpan :label="t('modules.financial.forms.invoice.street')"
               :value="form.model.street.value.value"
               :attributes="form.model.street.attr.value"
               @update:value="form.context.setFieldValue('street', $event)"
               :errors="form.context.errors.value.street"
               id="name" :placeholder="t('common.placeholders.street')" type="text" :disabled="!edit"/>

    <InputSpan :label="t('modules.financial.forms.invoice.postalCode')"
               :value="form.model.postalCode.value.value"
               :attributes="form.model.postalCode.attr.value"
               @update:value="form.context.setFieldValue('postalCode', $event)"
               :errors="form.context.errors.value.postalCode"
               id="name" :placeholder="t('common.placeholders.postalCode')" type="text" :disabled="!edit"/>

    <InputSpan :label="t('modules.financial.forms.invoice.city')"
               :value="form.model.city.value.value"
               :attributes="form.model.city.attr.value"
               @update:value="form.context.setFieldValue('city', $event)"
               :errors="form.context.errors.value.city"
               id="name" :placeholder="t('common.placeholders.city')" type="text" :disabled="!edit"/>

    <InputSpan :label="t('modules.financial.forms.invoice.country')"
               :value="form.model.country.value.value"
               :attributes="form.model.country.attr.value"
               @update:value="form.context.setFieldValue('country', $event)"
               :errors="form.context.errors.value.country"
               id="name" :placeholder="t('common.placeholders.country')" type="text" :disabled="!edit"/>
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import type { Form } from "@/utils/formUtils";
import * as yup from "yup";
import { updateInvoiceAddressingObject } from "@/utils/validation-schema";

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

<style scoped lang="scss">
</style>