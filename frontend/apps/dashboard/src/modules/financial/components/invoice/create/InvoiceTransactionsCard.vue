<template>
  <FormCard :header="t('modules.financial.invoice.transfer')"  @cancel="form.context.resetForm" :create="true">
    <div class="flex flex-column justify-content-between gap-2">
      <InvoiceTransactionsForm :form="form"/>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import InvoiceTransactionsForm from "@/modules/financial/components/invoice/forms/InvoiceTransactionsForm.vue";
import { createInvoiceObject } from "@/utils/validation-schema";
import { type Form } from "@/utils/formUtils";
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import * as yup from "yup";

const { t } = useI18n();

defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});
</script>

<style scoped lang="scss">

</style>
