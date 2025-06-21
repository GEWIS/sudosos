<template>
  <PageContainer>
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
        <Tabs class="w-full" :value="years[0].toString()">
          <TabList>
            <Tab v-for="year in years" :key="year" :value="year.toString()">{{ year.toString() }}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel v-for="year in years" :key="year" :value="year.toString()">
              <InvoiceTableYear :year="year" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InvoiceTableYear from '@/modules/financial/components/invoice/InvoiceTableYear.vue';
import router from '@/router';
import InvoiceAccountOverview from '@/modules/financial/views/invoice/InvoiceAccountOverview.vue';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';

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
