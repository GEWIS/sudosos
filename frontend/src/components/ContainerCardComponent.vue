<template>
  <div class="container-overview">
    <TabView :active-index=1 :scrollable="true">
      <TabPanel :header="$t('containersOverview.Containers')" :disabled="true" />
      <TabPanel v-for="container in containers" :key="container.id" :header="container.name">
        <ScrollPanel style="min-height: 22rem;">
          <ProductGridComponent :container="container"/>
        </ScrollPanel>
      </TabPanel>
    </TabView>

  </div>
</template>
<script setup lang="ts">
import type { ContainerWithProductsResponse } from "@sudosos/sudosos-client";
import { onMounted, ref } from "vue";
import ProductGridComponent from "@/components/ProductGridComponent.vue";
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ScrollPanel from "primevue/scrollpanel";
defineProps({
  containers: {
    type: Array<ContainerWithProductsResponse>,
    required: true,
  },
});
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

:deep(.p-disabled){
  a {
    color: white!important;
    background-color: #d40000!important;
    text-transform: uppercase;
  }
}
</style>
