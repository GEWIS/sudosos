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
          v-model:editingRows="editingRows"
          editMode="row"
          @row-edit-save="updateRow"
          @row-edit-init="rowEditInit"
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
          <Column field="image" header="Image" style="width: fit-content">
            <template #body="rowData">
              <img class="product-image" :src="getProductImageSrc(rowData.data)" alt="img" />
            </template>
          </Column>
          <Column field="name" header="Name">
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" style="width: 100%" />
            </template>
          </Column>
          <Column field="category" header="Category" style="width: 20%">
            <template #editor="{ data, field }">
              <Dropdown
                style="width: 100%"
                placeholder="Please select a product category"
                optionLabel="name"
                :options="categories"
                v-model="data[field]"
              >
                <template #value="slotProps">
                  {{ slotProps.value.name }}
                </template>
              </Dropdown>
            </template>
            <template #body="rowData">
              {{ rowData.data.category.name }}
            </template>
          </Column>
          <Column field="priceInclVat" header="Price">
            <template #editor="{ data, field }">
              <InputNumber
                v-model="data['editPrice']"
                mode="currency"
                currency="EUR"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                style="width: 100%"
              />
            </template>
            <template #body="rowData">
              {{ formatPrice(rowData.data.priceInclVat.amount) }}
            </template>
          </Column>
          <Column field="alcoholPercentage" header="Alcohol %">
            <template #editor="{ data, field }">
              <InputNumber v-model="data[field]" suffix="%" style="width: 100%" />
            </template>
            <template #body="rowData">
              {{ `${rowData.data.alcoholPercentage} %` }}
            </template>
          </Column>
          <Column field="vat" header="VAT">
            <template #editor="{ data, field }">
              <Dropdown
                placeholder="Please select a VAT group"
                :options="vatGroups"
                optionLabel="percentage"
                v-model="data[field]"
                style="width: 100%"
              >
                <template #value="slotProps"> {{ slotProps.value.percentage }}% </template>
              </Dropdown>
            </template>
            <template #body="rowData">
              {{ `${rowData.data.vat.percentage} %` }}
            </template>
          </Column>
          <Column
            :rowEditor="true"
            style="width: 10%; min-width: 8rem"
            bodyStyle="text-align:center"
          />
        </DataTable>
        <ProductModalComponent :product="selectedProduct" v-model:visible="visible" />
      </CardComponent>
      <ContainerCardComponent v-if="containers" :data="containers" class="container-card"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import {onBeforeMount, onMounted, Ref, ref} from 'vue';
import apiService from '@/services/ApiService';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import type {ContainerResponse, ContainerWithProductsResponse, ProductResponse} from '@sudosos/sudosos-client';
import DataTable, {DataTableRowEditInitEvent, DataTableRowEditSaveEvent} from 'primevue/datatable';
import Column from 'primevue/column';
import { getProductImageSrc } from '@/utils/imageUtils';
import {formatPrice} from "../utils/formatterUtils";
import {FilterMatchMode} from "primevue/api";
import InputText from "primevue/inputtext";
import ProductModalComponent from "@/components/ProductCreateComponent.vue";
import Dropdown from "primevue/dropdown";
import {BaseVatGroupResponse, ProductCategoryResponse} from "@sudosos/sudosos-client";

import ContainerCardComponent from "@/components/ContainerCardComponent.vue";

const containers: Ref<ContainerWithProductsResponse[]> = ref([]);

onBeforeMount(async ()=> {

});

const products: Ref<ProductResponse[]> = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  category: { value: null, matchMode: FilterMatchMode.EQUALS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const selectedProduct: Ref<ProductResponse | undefined | null> = ref();
const visible: Ref<Boolean> = ref(false);
const editingRows = ref([]);
const openCreateModal = (() => {
  selectedProduct.value = null;
  visible.value = true;
});
const vatGroups: Ref<BaseVatGroupResponse[]> = ref([]);
const categories: Ref<ProductCategoryResponse[]> = ref([]);

const rowEditInit = (event: DataTableRowEditInitEvent) => {
  event.data['editPrice'] = (event.data as ProductResponse).priceInclVat.amount / 100;
  console.error(event);
};

onMounted(async () => {
  const data = await fetchAllPages<ProductResponse>(
    0,
    Number.MAX_SAFE_INTEGER,
    // @ts-ignore
    (take, skip) => apiService.products.getAllProducts(take, skip)
  );
  products.value = data;
  const categoriesResp = await apiService.category.getAllProductCategories();
  categories.value = categoriesResp.data.records;
  const vatGroupsResp = await apiService.vatGroups.getAllVatGroups();
  vatGroups.value = vatGroupsResp.data.records;

  //TODO: Put getAllContainers into container store and take care of pagination
  await apiService.container.getAllContainers(500, 0).then((resp: any) => {
    (resp.data.records as ContainerResponse[]).forEach((container) => apiService.container.getSingleContainer(container.id).then((res) => {
      console.log(res);
      containers.value.push(res.data as ContainerWithProductsResponse);
    }));
    console.error(containers.value)
  });
});

const updateRow = async (event: DataTableRowEditSaveEvent) => {

  console.error(event.newData);
  const productUpdateResponse = await apiService.products.updateProduct(event.newData.id, {
    name: event.newData.name,
    priceInclVat: {
      amount: event.newData.editPrice * 100,
      currency: 'EUR',
      precision: 2,
    },
    vat: event.newData.vat.id,
    category: event.newData.category.id,
    alcoholPercentage: event.newData.alcoholPercentage,
  });
  products.value[event.index] = event.newData;
  console.log(productUpdateResponse);
};
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

:deep(.p-datatable-header) {
  background-color: #f8f8f8 !important;
  border: none !important;
}

:deep(.p-paginator) {
  background-color: #f8f8f8;
}

:deep(.p-inputtext) {
  width: 100%;
}

.content-wrapper {
  flex-direction: column;
}

.container-card {
  margin-top: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  background-color: #f8f8f8!important;
  min-width: 100%;
}

:deep(.p-tabview){
  background-color: #f8f8f8;
}

:deep(.p-tabview-nav-link ){
  background-color: #f8f8f8!important;
}

:deep(.p-tabview-panel){
  background-color: #f8f8f8;
}
:deep(.p-tabview-panels){
  background-color: #f8f8f8!important;
}
</style>
