<template>
  <PageContainer>
    <div class="flex flex-wrap gap-3">
      <div class="flex flex-col gap-3">
        <InvoiceCreateUserCard :form="form" />
        <InvoiceTransactionsCard :form="form" />
      </div>
      <div class="flex flex-col gap-3">
        <InvoiceCreateAddressingCard :form="form" />
        <InvoiceCreateSettingsCard :form="form" />
        <InvoiceCreate :form="form" />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import InvoiceTransactionsCard from '@/modules/financial/components/invoice/create/InvoiceTransactionsCard.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createInvoiceObject } from '@/utils/validation-schema';
import InvoiceCreateUserCard from '@/modules/financial/components/invoice/create/InvoiceCreateUserCard.vue';
import InvoiceCreateAddressingCard from '@/modules/financial/components/invoice/create/InvoiceCreateAddressingCard.vue';
import InvoiceCreateSettingsCard from '@/modules/financial/components/invoice/create/InvoiceCreateSettingsCard.vue';
import InvoiceCreate from '@/modules/financial/components/invoice/create/InvoiceCreate.vue';
import PageContainer from '@/layout/PageContainer.vue';

const form = schemaToForm(createInvoiceObject);
</script>

<style scoped lang="scss"></style>
