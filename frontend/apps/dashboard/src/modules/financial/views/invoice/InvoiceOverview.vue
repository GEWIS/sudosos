<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ t('modules.financial.invoice.title') }}</div>
      <div class="content-wrapper flex flex-column">
        <InvoiceAccountOverview />
        <div class="flex flex-row justify-content-end w-full -mb-5">
          <Button
              type="button"
              severity="primary"
              class="z-5"
              :label="t('modules.financial.invoice.create.create')"
              icon="pi pi-plus"
              @click="navigateToCreateInvoice"
          />
        </div>
          <TabView class="w-full">
            <TabPanel v-for="year in years" :key="year" :header="year.toString()">
              <InvoiceTableState :year="year" />
            </TabPanel>
          </TabView>
      </div>
  </div>
</template>

<script setup lang="ts">
import InvoiceTableState from "@/modules/financial/components/invoice/InvoiceTableState.vue";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import router from "@/router";
import InvoiceAccountOverview from "@/modules/financial/views/invoice/InvoiceAccountOverview.vue";

const { t } = useI18n();

const years = Array.from(
    { length: Number(new Date().getMonth() > 5) + new Date().getFullYear() - 2022 },
    (_, i) => new Date().getFullYear() + Number(new Date().getMonth() > 5) - i
);


const navigateToCreateInvoice = () => {
  router.push({ name: 'invoiceCreate' });
};
</script>

<style scoped lang="scss">

</style>
