<template>
  <CardComponent class="w-full" :header="t('modules.seller.posOverview.list.header')">
    <template #topAction>
      <div class="items-center flex flex-row justify-end">
        <Button
          v-if="isAllowed('create', ['own', 'organ'], 'PointOfSale', ['any'])"
          icon="pi pi-plus"
          :label="t('common.create')"
          @click="openCreatePOSModal"
        />
      </div>
    </template>
    <DataTable
      lazy
      paginator
      :rows="rows"
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      :total-records="totalRecords"
      :value="pointOfSales"
      @page="onPage($event)"
    >
      <Column field="name" :header="t('modules.seller.posOverview.list.posName')">
        <template v-if="isLoading" #body>
          <Skeleton class="h-2rem mr-8 my-1 surface-300 w-6" />
        </template>
      </Column>
      <Column field="owner.firstName" :header="t('common.owner')">
        <template v-if="isLoading" #body>
          <Skeleton class="h-2rem my-1 surface-300 w-6" />
        </template>
      </Column>
      <Column body-style="text-align: center; overflow: visible" header-style="width: 3rem; text-align: center">
        <template v-if="isLoading" #body>
          <Skeleton class="h-2rem my-1 surface-300 w-6" />
        </template>
        <template v-else #body="slotProps">
          <Button
            icon="pi pi-info-circle"
            outlined
            type="button"
            @click="router.push({ name: 'pointOfSaleInfo', params: { id: slotProps.data.id } })"
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
  <POSCreateModal v-model:is-visible="isCreateModalVisible" />
</template>
<script setup lang="ts">
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, type Ref, ref } from 'vue';
import type { PaginatedPointOfSaleResponse, PointOfSaleResponse } from '@sudosos/sudosos-client';
import Skeleton from 'primevue/skeleton';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import POSCreateModal from '@/modules/seller/components/POSCreateModal.vue';
import CardComponent from '@/components/CardComponent.vue';
import { isAllowed } from '@/utils/permissionUtils';

const { t } = useI18n();

const pointOfSales: Ref<PointOfSaleResponse[]> = ref(new Array(10));
const totalRecords = ref<number>(0);
const rows: Ref<number> = ref(10);
const isLoading: Ref<boolean> = ref(true);

const props = defineProps<{
  getPointsOfSale: (take: number, skip: number) => Promise<PaginatedPointOfSaleResponse | undefined>;
}>();

onMounted(async () => {
  const initialPointOfSales = await props.getPointsOfSale(rows.value, 0);

  if (!initialPointOfSales) return;

  pointOfSales.value = initialPointOfSales.records;

  totalRecords.value = initialPointOfSales._pagination.count || 0;

  isLoading.value = false;
});

async function onPage(event: DataTablePageEvent) {
  const newPointOfSales = await props.getPointsOfSale(event.rows, event.first);
  if (!newPointOfSales) {
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

<style scoped lang="scss"></style>
