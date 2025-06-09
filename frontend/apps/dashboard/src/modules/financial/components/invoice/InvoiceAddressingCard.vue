<template>
  <FormCard
    v-if="invoice"
    :enable-edit="!deleted"
    :header="t('modules.financial.forms.invoice.addressing')"
    @cancel="form.context.resetForm"
    @save="formSubmit"
    @update:model-value="edit = $event"
  >
    <div class="flex flex-col gap-2 justify-between">
      <InvoiceAddressingForm :edit="edit" :form="form" :invoice="invoice" @update:edit="edit = $event" />
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { InvoiceStatusResponseStateEnum } from '@sudosos/sudosos-client/src/api';
import { useI18n } from 'vue-i18n';
import FormCard from '@/components/FormCard.vue';
import InvoiceAddressingForm from '@/modules/financial/components/invoice/forms/InvoiceUpdateAddressingForm.vue';
import { updateInvoiceAddressingObject } from '@/utils/validation-schema';
import { schemaToForm } from '@/utils/formUtils';
import { useInvoiceStore } from '@/stores/invoice.store';

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

const form = schemaToForm(updateInvoiceAddressingObject);

const formSubmit = () => {
  void form.submit();
};
const updateFieldValues = (p: InvoiceResponse) => {
  if (!p) return;
  const values = {
    addressee: p.addressee,
    attention: p.attention,
    street: p.street,
    postalCode: p.postalCode,
    city: p.city,
    country: p.country,
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
