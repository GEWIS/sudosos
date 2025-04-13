<template>
  <FormCard :enable-edit="false" :header="t('modules.financial.forms.invoice.settings')">
    <div class="flex flex-column gap-2 justify-content-between">
      <InvoiceBaseSettingsForm :edit="edit" :form="form" />
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import FormCard from '@/components/FormCard.vue';
import { createInvoiceObject } from '@/utils/validation-schema';
import { type Form, getProperty } from '@/utils/formUtils';
import InvoiceBaseSettingsForm from '@/modules/financial/components/invoice/forms/InvoiceBaseSettingsForm.vue';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const edit = computed(() => {
  const forId = getProperty(props.form, 'forId');
  return forId !== undefined;
});
</script>

<style scoped lang="scss"></style>
