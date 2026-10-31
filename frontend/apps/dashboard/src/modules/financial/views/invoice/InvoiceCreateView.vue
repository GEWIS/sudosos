<template>
  <PageContainer>
    <div class="flex flex-wrap gap-3">
      <div class="flex flex-col md:flex-row gap-3 flex-grow">
        <div class="flex flex-col gap-3 flex-grow">
          <InvoiceCreateUserCard class="flex-grow" :form="form" />
          <InvoiceTransactionsCard class="flex-grow" :form="form" />
        </div>
        <InvoiceCreateDetailsCard class="flex-grow" :form="form" />
      </div>
      <InvoiceCreateEntriesCard class="w-full" :form="form" />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import InvoiceTransactionsCard from '@/modules/financial/components/invoice/create/InvoiceTransactionsCard.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createInvoiceObject } from '@/utils/validation-schema';
import InvoiceCreateUserCard from '@/modules/financial/components/invoice/create/InvoiceCreateUserCard.vue';
import InvoiceCreateDetailsCard from '@/modules/financial/components/invoice/create/InvoiceCreateDetailsCard.vue';
import InvoiceCreateEntriesCard from '@/modules/financial/components/invoice/create/InvoiceCreateEntriesCard.vue';
import PageContainer from '@/layout/PageContainer.vue';

const form = schemaToForm(createInvoiceObject);
</script>

<style scoped lang="scss"></style>
