<template>
  <PageContainer v-if="invoice" class="items-center flex flex-col gap-5 max-w-[100rem]">
    <div>
      <div class="flex flex-row text-4xl mb-4">
        <div class="flex flex-col">
          <span>{{ t('modules.financial.invoice.invoice') }}</span>
          <small class="text-base">
            {{ invoice.reference + ': ' }} <i>{{ invoice.description }}</i>
          </small>
          <span v-if="dirty" class="text-red-500">
            <i class="pi pi-exclamation-triangle text-4xl"></i>
            {{ t('modules.financial.invoice.dirty') }}
          </span>
        </div>
      </div>
      <div class="flex flex-grow flex-row flex-wrap gap-5 justify-center">
        <div class="flex flex-col gap-5">
          <InvoiceAmountCard v-if="dirty" :invoice-id="invoice.id" />
          <InvoiceStepsCard v-else :invoice-id="invoice.id" />
          <InvoiceSettingsCard :invoice-id="invoice.id" />
          <InvoiceAddressingCard :invoice-id="invoice.id" />
          <InvoiceInfo :invoice-id="invoice.id" />
        </div>
        <div class="flex flex-col gap-5">
          <InvoiceVatCard v-if="invoice" :invoice-id="invoice.id" />
          <InvoicePdf v-if="invoice" :invoice-id="invoice.id" />
        </div>
      </div>
    </div>
  </PageContainer>
  <PageContainer v-else>
    <Skeleton class="items-center flex flex-col gap-5" />
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watchEffect, type Ref } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import Skeleton from 'primevue/skeleton';
import { handleError } from '@/utils/errorUtils';
import { useInvoiceStore } from '@/stores/invoice.store';
import 'vue3-pdf-app/dist/icons/main.css';
import router from '@/router';
import InvoiceSettingsCard from '@/modules/financial/components/invoice/InvoiceSettingsCard.vue';
import InvoiceAddressingCard from '@/modules/financial/components/invoice/InvoiceAddressingCard.vue';
import InvoiceStepsCard from '@/modules/financial/components/invoice/InvoiceStepsCard.vue';
import InvoicePdf from '@/modules/financial/components/invoice/InvoicePdf.vue';
import InvoiceInfo from '@/modules/financial/components/invoice/InvoiceInfo.vue';
import InvoiceAmountCard from '@/modules/financial/components/invoice/InvoiceAmountCard.vue';
import { isDirty } from '@/utils/invoiceUtil';
import PageContainer from '@/layout/PageContainer.vue';
import InvoiceVatCard from '@/modules/financial/components/invoice/InvoiceVatCard.vue';

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const invoiceStore = useInvoiceStore();

const invoice: Ref<InvoiceResponse | undefined> = ref(undefined);

// Invoice is considered dirty if entry total does not match transfer total
const dirty = computed(() => isDirty(invoice.value as InvoiceResponse));

watchEffect(() => {
  if (invoice.value) {
    document.title = `${t('common.titles.invoice')} #${invoice.value.id} - ${t('common.titles.invoices')} | ${t('common.sudosos')}`;
  }
});

onBeforeMount(async () => {
  const id = Number(route.params.id);
  await invoiceStore
    .fetchInvoice(id)
    .catch((error) => {
      handleError(error, toast);
    })
    .then((res) => {
      invoice.value = res as InvoiceResponse;
    });

  if (!invoice.value) {
    await router.replace('/error');
    return;
  }
});
</script>

<style scoped lang="scss"></style>
