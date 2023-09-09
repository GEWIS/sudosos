<template>
  <div class="page-container">
    <div class="page-title">Manage Products and Containers</div>
    <div class="content-wrapper">
      <CardComponent header="all products">
        <DataTable
            v-model:filters="filters"
            :value="products"
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 25, 50, 100]"
            filterDisplay="menu"
            :globalFilterFields="['category', 'name']"
        >
          <template #header>
            <div class="product-table-header">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Search" />
              </span>
              <span>
                <Button severity="danger" @click="openCreateModal">Create</Button>
              </span>
            </div>
          </template>
          <Column field="image" header="Image">
            <template #body="rowData">
              <img class="product-image" :src="getProductImageSrc( rowData.data)" alt="img"/>
            </template>
          </Column>
          <Column field="name" header="Name" />
          <Column field="category.name" header="Category" />
          <Column field="priceInclVat.amount" header="Price">
            <template #body="rowData">
              {{formatPrice(rowData.data.priceInclVat.amount)}}
            </template>
          </Column>
          <Column field="alcoholPercentage" header="Alcohol %">
            <template #body="rowData">
              {{ `${rowData.data.alcoholPercentage} %` }}
            </template>
          </Column>
          <Column headerStyle="width: 3rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
            <template #body="slotProps">
              <Button
                  @click="console.log('needs to be implemented')"
                  type="button"
                  severity='danger'
                  icon="pi pi-info-circle"
                  outlined
              />
            </template>
          </Column>
        </DataTable>
        <ProductModalComponent :product="selectedProduct" v-model:visible="visible" />
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import { onMounted, Ref, ref } from 'vue';
import apiService from '@/services/ApiService';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import type { ProductResponse } from '@sudosos/sudosos-client';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { getProductImageSrc } from '@/utils/imageUtils';
import {formatPrice} from "../utils/formatterUtils";
import {FilterMatchMode} from "primevue/api";
import InputText from "primevue/inputtext";
import ProductModalComponent from "@/components/ProductCreateComponent.vue";

const products: Ref<ProductResponse[]> = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  category: { value: null, matchMode: FilterMatchMode.EQUALS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const selectedProduct: Ref<ProductResponse | undefined | null> = ref();
const visible: Ref<Boolean> = ref(false);

const openCreateModal = (() => {
  selectedProduct.value = null;
  visible.value = true;
});

onMounted(async () => {
  const data = await fetchAllPages<ProductResponse>(
    0,
    Number.MAX_SAFE_INTEGER,
    // @ts-ignore
    (take, skip) => apiService.products.getAllProducts(take, skip)
  );
  products.value = data;
  console.warn(data);
});
</script>

<style scoped>
@import '../styles/BasePage.css';

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f8f8;
  border-top: none;
  text-transform: uppercase;
  font-family: Lato, Arial, sans-serif !important;
  font-size: 1rem;
  padding: 0.375rem 0;
  line-height: 1.5;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: #f8f8f8;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.375rem 0.2rem;
  font-size: 1rem;
  font-family: Lato, Arial, sans-serif !important;
}

.product-image {
  height: 4rem;
}

.p-panel {
  width: 100%;
}

.product-table-header {
  background-color: #f8f8f8;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

:deep(.p-datatable-header ){
  background-color: #f8f8f8!important;
  border: none!important;
}

:deep(.p-paginator){
  background-color: #f8f8f8;
}
</style>
