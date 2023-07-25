<template>
  <CardComponent header="containers">
    <DataTable v-model:expandedRows="expandedContainers" :value="containers">
      <Column field="name" />
      <Column expander style="width: 2rem"/>
      <template #expansion="slotProps">
        <ProductGridComponent :products="slotProps.data.products" />
      </template>
    </DataTable>

  </CardComponent>
</template>
<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import CardComponent from "@/components/CardComponent.vue";
import type {ContainerWithProductsResponse} from "@sudosos/sudosos-client";
import {onMounted, ref} from "vue";
import ProductGridComponent from "@/components/ProductGridComponent.vue";


const props = defineProps({
  data: {
    type: Array<ContainerWithProductsResponse>,
    required: true,
  },
  editMode: {
    type: Boolean,
    required: false,
  }
});
onMounted(()=>{
  if (props.editMode){console.error("Edit mode is on");}
  containers.value = props.data;

});
const containers = ref();
const expandedContainers = ref();
</script>
<style scoped lang="scss">
:deep(.p-datatable-thead) {
  display: none;
}

:deep(.p-datatable-table){
  border-collapse: separate;
  border-spacing: 0 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr){
  background-color: #f2f2f2;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.25rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  font-family: Lato,Arial,sans-serif!important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td:not(:first-child)) {
  border-left: none; /* Remove the left border for all cells except the first child */
}

:deep(.p-datatable .p-datatable-tbody > tr > td:not(:last-child)) {
  border-right: none; /* Remove the left border for all cells except the first child */
}
</style>
