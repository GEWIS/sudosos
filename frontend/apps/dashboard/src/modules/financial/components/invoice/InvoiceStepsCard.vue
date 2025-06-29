<template>
  <CardComponent v-if="invoice" :header="t('common.status')">
    <Stepper v-if="!deleted" :value="activeStep + 1">
      <StepList>
        <Step
          v-for="stepItem in stepItems"
          :key="stepItem.label"
          :disabled="stepItem.disabled()"
          :value="stepItem.index + 1"
          @click="() => void updateStep(stepItem.label)"
        >
          {{ stepItem.label }}
        </Step>
      </StepList>
    </Stepper>
    <div v-else class="items-center flex flex-col justify-center">
      <i class="pi pi-exclamation-triangle text-5xl"></i>
      <p class="text-2xl">{{ t('modules.financial.invoice.deleted') }}</p>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { InvoiceStatusResponseStateEnum } from '@sudosos/sudosos-client';
import CardComponent from '@/components/CardComponent.vue';
import { useInvoiceCard } from '@/composables/invoiceCard';
import { useInvoiceStore } from '@/stores/invoice.store';

const { t } = useI18n();
const props = defineProps<{ invoiceId: number }>();

const invoiceStore = useInvoiceStore();
const { invoice, deleted } = useInvoiceCard(props.invoiceId);

const steps = [
  InvoiceStatusResponseStateEnum.Created,
  InvoiceStatusResponseStateEnum.Sent,
  InvoiceStatusResponseStateEnum.Paid,
  InvoiceStatusResponseStateEnum.Deleted,
];

const activeStep = computed(() => (invoice.value ? steps.indexOf(invoice.value.currentState.state) : 0));

const loading = ref(false);

const stepItems = computed(() =>
  steps.slice(0, 3).map((value, index) => ({
    index,
    label: value,
    disabled: () => activeStep.value >= index || loading.value,
    command: () => {
      void updateStep(value);
    },
  })),
);

async function updateStep(value: InvoiceStatusResponseStateEnum) {
  loading.value = true;
  await invoiceStore.updateInvoice(invoice.value.id, { state: value });
  loading.value = false;
}
</script>
