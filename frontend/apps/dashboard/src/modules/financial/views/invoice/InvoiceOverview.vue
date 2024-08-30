<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ t('c_invoiceInfo.InvoiceOverview') }}</div>
      <div class="content-wrapper">
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

const { t } = useI18n();

const states = [ InvoiceStatusResponseStateEnum.Created, InvoiceStatusResponseStateEnum.Sent,
  InvoiceStatusResponseStateEnum.Paid, InvoiceStatusResponseStateEnum.Deleted ];

</script>

<style scoped lang="scss">

</style>
