<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('modules.financial.invoice.transfer')"
               :value="form.model.amount.value.value"
               :attributes="form.model.amount.attr.value"
               @update:value="form.context.setFieldValue('amount', $event)"
               :errors="form.context.errors.value.amount"
               id="name" placeholder="0" type="currency" :disabled="!edit"/>
    {{ t('modules.financial.invoice.total', { total: formatPrice(entryTotal) }) }}
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { useInvoiceStore } from "@/stores/invoice.store";
import { computed, type PropType } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { type Form, setSubmit } from "@/utils/formUtils";
import * as yup from "yup";
import { updateInvoiceAmountObject } from "@/utils/validation-schema";
import { handleError } from "@/utils/errorUtils";
import { formatPrice } from "@/utils/formatterUtils";
import type { DineroObject } from "dinero.js";

const { t } = useI18n();
const toast = useToast();
const invoiceStore = useInvoiceStore();

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateInvoiceAmountObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits(['update:edit']);

const entryTotal = computed(() => {
  const total: DineroObject = { amount: 0, precision: 2, currency: 'EUR' };
  props.invoice.invoiceEntries.forEach((entry) => {
    total.amount += ((entry.amount * entry.priceInclVat.amount));
  });
  return total;
});

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  await invoiceStore.updateInvoice(props.invoice.id, { amount: {
      amount: Math.round(values.amount * 100),
      currency: 'EUR',
      precision: 2
    } }).then(() => {
    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.invoiceAmountUpdated'),
      life: 3000,
    });
    emit('update:edit', false);
  }).catch((error) => {
    handleError(error, toast);
  });
}));
</script>

<style scoped lang="scss">

</style>
