<template>
  <FormCard :enable-edit="false" :header="t('modules.financial.forms.invoice.details')">
    <!-- Container query: side by side when the card is wide, stacked when it shares the row (summary step). -->
    <div class="@container">
      <div class="flex flex-col @2xl:flex-row gap-8">
        <div class="flex flex-col gap-2 flex-1">
          <h4 class="font-semibold m-0">{{ t('modules.financial.forms.invoice.settings') }}</h4>
          <InvoiceBaseSettingsForm :edit="edit" :form="form" />
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <h4 class="font-semibold m-0">{{ t('modules.financial.forms.invoice.addressing') }}</h4>
          <InvoiceBaseAddressingForm :edit="edit" :form="form" />
        </div>
      </div>
    </div>
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
import InvoiceBaseSettingsForm from '@/modules/financial/components/invoice/forms/InvoiceBaseSettingsForm.vue';
import InvoiceBaseAddressingForm from '@/modules/financial/components/invoice/forms/InvoiceBaseAddressingForm.vue';

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
