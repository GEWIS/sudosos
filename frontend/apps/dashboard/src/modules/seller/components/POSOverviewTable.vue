<template>
  <CardComponent :header="$t('app.Points of Sale')" class="w-full">
    <template #topAction>
      <div class="flex flex-row align-items-center justify-content-end">
        <Button :label="$t('app.Create')" icon="pi pi-plus" @click="openCreatePOSModal"/>
      </div>
    </template>
    <DataTable :rows="rows" :value="pointOfSales" :rowsPerPageOptions="[5, 10, 25, 50, 100]" paginator lazy
               @page="onPage($event)" :totalRecords="totalRecords">
      <Column field="name" :header="$t('c_POSCreate.Title')">
        <template #body v-if="isLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="owner.firstName" :header="$t('c_POSCreate.Owner')">
        <template #body v-if="isLoading">
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column headerStyle="width: 3rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
        <template #body v-if="isLoading">
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
        <template #body="slotProps" v-else>
          <Button
              @click="router.push({name: 'pointOfSaleInfo', params: {id: slotProps.data.id}})"
              type="button"
              icon="pi pi-info-circle"
              outlined
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
  <POSCreateModal v-model:is-visible="isCreateModalVisible"/>
</template>
<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, type Ref, ref } from "vue";
import type { PaginatedPointOfSaleResponse, PointOfSaleResponse } from "@sudosos/sudosos-client";
import Skeleton from "primevue/skeleton";
import router from "@/router";
import POSCreateModal from "@/modules/seller/components/POSCreateModal.vue";
const pointOfSales: Ref<PointOfSaleResponse[]> = ref(new Array(10));
const totalRecords = ref<number>(0);
const rows: Ref<number> = ref(10);
const isLoading: Ref<boolean> = ref(true);

const props = defineProps<{
  getPointsOfSale: (take: number, skip: number) => Promise<PaginatedPointOfSaleResponse | undefined>,
}>();

onMounted(async () => {
  const initialPointOfSales = await props.getPointsOfSale(rows.value, 0);

  if(!initialPointOfSales) return;

  pointOfSales.value = initialPointOfSales.records;

  totalRecords.value = initialPointOfSales._pagination.count || 0;

  isLoading.value = false;
});

async function onPage(event: DataTablePageEvent) {
  const newPointOfSales = await props.getPointsOfSale(event.rows, event.first);
  if(!newPointOfSales) {
    isLoading.value = true;
    return;
  }
  pointOfSales.value = newPointOfSales.records;
}

const isCreateModalVisible = ref(false);

function openCreatePOSModal() {
  isCreateModalVisible.value = true;
}

</script>

<style scoped lang="scss">
</style>
