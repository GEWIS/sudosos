<template>
  <div class="flex flex-column page-container">
    <div class="page-title">{{ t('modules.financial.invoice.title') }}</div>
    <div class="content-wrapper flex flex-column">
      <InvoiceAccountOverview />
      <div class="-mb-5 flex flex-row justify-content-end w-full">
        <Button
          class="z-5"
          icon="pi pi-plus"
          :label="t('modules.financial.invoice.create.create')"
          severity="primary"
          type="button"
          @click="navigateToCreateInvoice"
        />
      </div>
      <TabView class="w-full">
        <TabPanel v-for="year in years" :key="year" :header="year.toString()">
          <InvoiceTableYear :year="year" />
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InvoiceTableYear from '@/modules/financial/components/invoice/InvoiceTableYear.vue';
import router from '@/router';
import InvoiceAccountOverview from '@/modules/financial/views/invoice/InvoiceAccountOverview.vue';

const { t } = useI18n();

const years = Array.from(
  { length: Number(new Date().getMonth() > 5) + new Date().getFullYear() - 2022 },
  (_, i) => new Date().getFullYear() + Number(new Date().getMonth() > 5) - i,
);

const navigateToCreateInvoice = () => {
  void router.push({ name: 'invoiceCreate' });
};
</script>

<style scoped lang="scss"></style>
