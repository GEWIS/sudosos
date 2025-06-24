<template>
  <div class="flex flex-col gap-2 justify-between">
    <InputSpan
      id="name"
      v-bind="form.model.amount.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.amount"
      :label="t('modules.financial.invoice.transfer')"
      placeholder="0"
      type="currency"
      :value="form.model.amount.value.value"
      @update:value="form.context.setFieldValue('amount', $event)"
    />
    {{ t('modules.financial.invoice.total', { total: formatPrice(entryTotal) }) }}
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { computed, type PropType } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import * as yup from 'yup';
import type { DineroObject } from 'dinero.js';
import InputSpan from '@/components/InputSpan.vue';
import { useInvoiceStore } from '@/stores/invoice.store';
import { type Form, setSubmit } from '@/utils/formUtils';
import { updateInvoiceAmountObject } from '@/utils/validation-schema';
import { handleError } from '@/utils/errorUtils';
import { formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();
const toast = useToast();
const invoiceStore = useInvoiceStore();

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true,
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
    total.amount += entry.amount * entry.priceInclVat.amount;
  });
  return total;
});

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    invoiceStore
      .updateInvoice(props.invoice.id, {
        amount: {
          amount: Math.round(values.amount * 100),
          currency: 'EUR',
          precision: 2,
        },
      })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.invoiceAmountUpdated'),
          life: 3000,
        });
        emit('update:edit', false);
      })
      .catch((error) => {
        handleError(error, toast);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
