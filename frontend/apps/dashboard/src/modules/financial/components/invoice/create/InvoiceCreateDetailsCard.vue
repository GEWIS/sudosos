<template>
  <FormCard :enable-edit="false" :header="t('modules.financial.forms.invoice.details')">
    <div class="flex flex-col gap-2">
      <h4 class="font-semibold m-0">{{ t('modules.financial.forms.invoice.settings') }}</h4>
      <InvoiceBaseSettingsForm :edit="edit" :form="form" />

      <Divider />

      <h4 class="font-semibold m-0">{{ t('modules.financial.forms.invoice.addressing') }}</h4>
      <InvoiceBaseAddressingForm :edit="edit" :form="form" />
    </div>
  </FormCard>
</template>

<script setup lang="ts">
/**
 * Combined settings (reference, date, description) and addressing fields for a new invoice.
 * Fields stay disabled until a user is selected, since selecting one fills in the address.
 */

import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import FormCard from '@/components/FormCard.vue';
import { createInvoiceObject } from '@/utils/validation-schema';
import { type Form, getProperty } from '@/utils/formUtils';
import InvoiceBaseSettingsForm from '@/modules/financial/components/invoice/forms/InvoiceBaseSettingsForm.vue';
import InvoiceBaseAddressingForm from '@/modules/financial/components/invoice/forms/InvoiceBaseAddressingForm.vue';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const edit = computed(() => getProperty(props.form, 'forId') !== undefined);
</script>

<style scoped lang="scss"></style>
