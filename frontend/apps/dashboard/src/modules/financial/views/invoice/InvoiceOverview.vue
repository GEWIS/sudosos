<template>
  <PageContainer class="max-w-[100rem]">
    <div class="flex flex-col">
      <InvoiceAccountOverview />
      <CardComponent class="w-full" :header="t('modules.financial.invoice.header')">
        <template #topAction>
          <Button
            icon="pi pi-plus"
            :label="t('modules.financial.invoice.create.create')"
            @click="navigateToCreateInvoice"
          />
        </template>

        <InvoiceTableYear />
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InvoiceAccountOverview from '@/modules/financial/views/invoice/InvoiceAccountOverview.vue';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';
import router from '@/router';
import InvoiceTableYear from '@/modules/financial/components/invoice/InvoiceTableYear.vue';

const { t } = useI18n();

const navigateToCreateInvoice = () => {
  void router.push({ name: 'invoiceCreate' });
};
</script>
