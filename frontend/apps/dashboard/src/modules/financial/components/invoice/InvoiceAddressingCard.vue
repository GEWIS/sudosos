<template>
  <FormCard :header="t('c_invoiceInfo.Addressing')" v-if="invoice" @cancel="form.context.resetForm"
            @update:modelValue="edit = $event" @save="formSubmit" :enableEdit="!deleted">
    <div class="flex flex-column justify-content-between gap-2">
      <InvoiceAddressingForm :invoice="invoice" :form="form" :edit="edit" @update:edit="edit = $event"/>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import { computed, onBeforeMount, ref, watch } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import InvoiceAddressingForm from "@/modules/financial/components/invoice/forms/InvoiceAddressingForm.vue";
import { updateInvoiceAddressingObject } from "@/utils/validation-schema";
import { schemaToForm } from "@/utils/formUtils";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import { useInvoiceStore } from "@/stores/invoice.store";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const edit = ref(false);
const invoiceStore = useInvoiceStore();
const deleted = computed(() => invoice.value.currentState.state === InvoiceStatusResponseStateEnum.Deleted);
const invoice = computed(() => invoiceStore.getInvoice(props.invoiceId) as InvoiceResponse);

const props = defineProps({
  invoiceId: {
    type: Number,
    required: true
  }
});

const form = schemaToForm(updateInvoiceAddressingObject);

const formSubmit = () => {
  form.submit();
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

watch(() => invoice.value, (newValue) => {
  updateFieldValues(newValue);
});

onBeforeMount(() => {
  if (invoice.value) {
    updateFieldValues(invoice.value);
  }
});

</script>

<style scoped lang="scss">

</style>
