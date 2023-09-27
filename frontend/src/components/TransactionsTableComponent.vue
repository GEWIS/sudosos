<template>
<CardComponent :action="action" :header="header" :router-link="routerLink">
  <DataTable :value="products" tableStyle="min-width: 50rem">
    <Column field="when" :header="$t('c_recentTransactionsTable.when')" />
    <Column field="what" :header="$t('c_recentTransactionsTable.what')" />
  </DataTable>
</CardComponent>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import CardComponent from "@/components/CardComponent.vue";
import type { PaginatedFinancialMutationResponse } from "@sudosos/sudosos-client";
import { onMounted, ref } from "vue";

defineProps({
  action: {
    type: String,
    required: false,
  },
  header: {
    type: String,
    required: true,
  },
  routerLink: {
    type: String,
    required: false,
  },
  Transactions: {
    type: Object as () => PaginatedFinancialMutationResponse,
    required: false,
  },
  isRecent: {
    type: Boolean,
    required: false,
  }
});
onMounted(()=> {
  products.value = [
    { when: '19-07-2023 - 14:06', what: 'You spent a total of €87.50' },
    { when: '03-06-2023 - 11:31', what: 'You spent a total of €3.50' },
    { when: '02-06-2023 - 20:28', what: 'You spent a total of €2.20' },
  ];
});
const products = ref();

</script>

<style scoped lang="scss">
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f8f8;
  border-top: none;
  text-transform: uppercase;
  font-family: Lato,Arial,sans-serif!important;
  font-size: 1rem;
  padding: 0.375rem 0;
  line-height: 1.5;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: #f8f8f8;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  font-family: Lato,Arial,sans-serif!important;
}


</style>
