<template>
  <CardComponent :header="$t('c_invoiceInfo.Progress')" v-if="invoice">
    <Steps v-if="!deleted" :model="stepItems" :readonly="false" :activeStep="activeStep"></Steps>
    <div v-else class="flex flex-column justify-content-center align-items-center">
      <i class="pi pi-exclamation-triangle text-5xl"></i>
      <p class="text-2xl">{{ $t('c_invoiceInfo.Deleted') }}</p>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { computed, ref } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import { useInvoiceStore } from "@/stores/invoice.store";

const invoiceStore = useInvoiceStore();

const steps = [InvoiceStatusResponseStateEnum.Created,
  InvoiceStatusResponseStateEnum.Sent, InvoiceStatusResponseStateEnum.Paid, InvoiceStatusResponseStateEnum.Deleted];
const activeStep = computed(() => steps.indexOf(invoice.value.currentState.state));
const deleted = computed(() => invoice.value.currentState.state === InvoiceStatusResponseStateEnum.Deleted);
const loading = ref(false);

const stepItems = steps.slice(0, 3).map((value, index) => {
  return {
    label: value,
    disabled: () => activeStep.value >= index || loading.value,
    command: () => {
      updateStep(index, value);
    }
  };
});

const updateStep = async (index: number, value: InvoiceStatusResponseStateEnum) => {
  loading.value = true;
  await invoiceStore.updateInvoice(invoice.value.id, { state: value });
  loading.value = false;
};

const invoice = computed(() => invoiceStore.getInvoice(props.invoiceId) as InvoiceResponse);
const props = defineProps({
  invoiceId: {
    type: Number,
    required: true
  }
});

</script>

<style scoped lang="scss">

</style>
