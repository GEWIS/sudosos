<template>
  <FormCard
    v-if="invoice"
    :enable-edit="!deleted"
    :header="t('modules.financial.invoice.transfer')"
    @cancel="form.context.resetForm"
    @save="formSubmit"
    @update:model-value="edit = $event"
  >
    <div class="flex flex-col gap-2 justify-between">
      <InvoiceAmountForm :edit="edit" :form="form" :invoice="invoice" @update:edit="edit = $event" />
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { InvoiceStatusResponseStateEnum } from '@sudosos/sudosos-client/src/api';
import { useI18n } from 'vue-i18n';
import { updateInvoiceAmountObject } from '@/utils/validation-schema';
import { schemaToForm } from '@/utils/formUtils';
import { useInvoiceStore } from '@/stores/invoice.store';
import InvoiceAmountForm from '@/modules/financial/components/invoice/forms/InvoiceAmountForm.vue';
import FormCard from '@/components/FormCard.vue';

const { t } = useI18n();

const edit = ref(false);
const invoiceStore = useInvoiceStore();
const deleted = computed(() => invoice.value.currentState.state === InvoiceStatusResponseStateEnum.Deleted);
const invoice = computed(() => invoiceStore.getInvoice(props.invoiceId) as InvoiceResponse);

const props = defineProps({
  invoiceId: {
    type: Number,
    required: true,
  },
});

const form = schemaToForm(updateInvoiceAmountObject);

const formSubmit = () => {
  void form.submit();
};

const updateFieldValues = (p: InvoiceResponse) => {
  if (!p || !p.transfer) return;
  const values = {
    amount: p.transfer.amountInclVat.amount / 100,
  };
  form.context.resetForm({ values });
};

watch(
  () => invoice.value,
  (newValue) => {
    updateFieldValues(newValue);
  },
);

onBeforeMount(() => {
  if (invoice.value) {
    updateFieldValues(invoice.value);
  }
});
</script>

<style scoped lang="scss"></style>
