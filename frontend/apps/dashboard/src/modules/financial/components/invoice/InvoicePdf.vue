<template>
  <CardComponent header="">
    <template #topAction>
      <div class="flex flex-row gap-1 justify-between" style="width: 40vw">
        <div>
          <Button
            icon="pi pi-eye"
            :label="showTable ? t('modules.financial.invoice.invoice') : t('modules.financial.invoice.table')"
            severity="primary"
            @click="showTable = !showTable"
          />
        </div>
        <div class="flex flex-row gap-3">
          <Button
            icon="pi pi-sync"
            :label="t('modules.financial.invoice.recompile')"
            severity="primary"
            @click="reloadPdf"
          />
          <Button
            icon="pi pi-refresh"
            :label="t('modules.financial.invoice.reload')"
            severity="secondary"
            @click="reloadPdf"
          />
        </div>
      </div>
    </template>
    <div class="pdf-display" :class="{ hidden: showTable }">
      <div
        v-if="missingPdf && pdfLoaded"
        class="items-center flex flex-col h-full justify-center text-4xl text-red-500 w-full"
      >
        <i class="pi pi-exclamation-triangle text-5xl"></i>
        {{ t('modules.financial.invoice.missingPdf') }}
      </div>
      <Skeleton v-if="!pdfLoaded" class="h-full w-full" />
      <vue-pdf-app
        v-if="showPdf"
        class="h-full w-full z-index"
        :pdf="getInvoicePdfSrc(invoice.pdf ? invoice.pdf : '')"
      />
    </div>
    <div class="overflow-scroll pdf-display" :class="{ hidden: !showTable }">
      <InvoiceEntriesTable :invoice="invoice" />
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import VuePdfApp from 'vue3-pdf-app';
import { useI18n } from 'vue-i18n';
import { getInvoicePdfSrc } from '@/utils/urlUtils';
import { handleError } from '@/utils/errorUtils';
import { useInvoiceStore } from '@/stores/invoice.store';
import CardComponent from '@/components/CardComponent.vue';
import InvoiceEntriesTable from '@/modules/financial/components/invoice/InvoiceEntriesTable.vue';

const { t } = useI18n();

const invoiceStore = useInvoiceStore();
const toast = useToast();
const invoice = computed(() => invoiceStore.getInvoice(props.invoiceId) as InvoiceResponse);

const props = defineProps({
  invoiceId: {
    type: Number,
    required: true,
  },
});

const showPdf = computed(() => pdfLoaded.value && !missingPdf.value);
const showTable = ref(false);
const pdfLoaded = ref(false);
const missingPdf = ref(false);

onMounted(() => {
  pdfLoaded.value = true;
  if (!invoice.value.pdf) {
    missingPdf.value = true;
  }
});

const reloadPdf = () => {
  if (!invoice.value) return;
  pdfLoaded.value = false;
  invoiceStore
    .fetchInvoicePdf(invoice.value.id)
    .catch((error) => handleError(error, toast))
    .finally(() => {
      pdfLoaded.value = true;
    });
};
</script>

<style scoped lang="scss">
.pdf-display {
  height: 80vh;
  width: 40vw;
}

:deep(.pdf-app .toolbar) {
  z-index: 3 !important;
}

:deep(.pdf-app #sidebarContainer) {
  z-index: 3 !important;
}
</style>
