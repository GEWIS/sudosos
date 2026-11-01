<template>
  <div class="@container">
    <div class="flex flex-col @2xl:flex-row gap-6 @2xl:gap-8">
      <div class="flex flex-col gap-2 flex-1">
        <h4 class="font-semibold">{{ t('modules.financial.forms.invoice.settings') }}</h4>
        <InvoiceBaseSettingsForm :edit="edit" :form="form" />
      </div>
      <div class="flex flex-col gap-2 flex-1">
        <h4 class="font-semibold">{{ t('modules.financial.forms.invoice.addressing') }}</h4>
        <InvoiceBaseAddressingForm :edit="edit" :form="form" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import type { Form } from '@/utils/formUtils';
import { updateInvoiceDetailsObject } from '@/utils/validation-schema';
import InvoiceBaseSettingsForm from '@/modules/financial/components/invoice/forms/InvoiceBaseSettingsForm.vue';
import InvoiceBaseAddressingForm from '@/modules/financial/components/invoice/forms/InvoiceBaseAddressingForm.vue';

const { t } = useI18n();

defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateInvoiceDetailsObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
