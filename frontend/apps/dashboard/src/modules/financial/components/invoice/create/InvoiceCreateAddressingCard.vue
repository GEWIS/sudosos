<template>
  <FormCard :header="t('modules.financial.forms.invoice.addressing')" :enable-edit="false">
    <div class="flex flex-column justify-content-between gap-2">
      <InvoiceBaseAddressingForm :form="form" :edit="edit"/>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import { computed, type PropType } from "vue";
import { createInvoiceObject } from "@/utils/validation-schema";
import { type Form, getProperty } from "@/utils/formUtils";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import InvoiceBaseAddressingForm from "@/modules/financial/components/invoice/forms/InvoiceBaseAddressingForm.vue";

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const edit = computed(() => {
  const forId = getProperty(props.form, "forId");
  return forId !== undefined;
});
</script>

<style scoped lang="scss">

</style>
