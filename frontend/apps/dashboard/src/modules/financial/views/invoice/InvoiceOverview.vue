<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ t('modules.financial.invoice.title') }}</div>
      <div class="content-wrapper flex flex-column">
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
            <TabPanel v-for="state in states" :key="state" :header="state">
              <InvoiceTable :state="state" />
            </TabPanel>
          </TabView>
      </div>
  </div>
</template>

<script setup lang="ts">
import InvoiceTable from "@/modules/financial/components/invoice/InvoiceTable.vue";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import router from "@/router";

const { t } = useI18n();

const states = [ InvoiceStatusResponseStateEnum.Created, InvoiceStatusResponseStateEnum.Sent,
  InvoiceStatusResponseStateEnum.Paid, InvoiceStatusResponseStateEnum.Deleted ];

const navigateToCreateInvoice = () => {
  router.push({ name: 'invoiceCreate' });
};
</script>

<style scoped lang="scss">

</style>
