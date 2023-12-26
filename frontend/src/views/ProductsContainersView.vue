<template>
  <div class="page-container">
    <div class="page-title">{{ $t('manageProducts.Manage all products and containers') }}</div>
    <div class="flex flex-column gap-5">
      <CardComponent header="all products" class="w-full">
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
            <div class="flex flex-row justify-content-between">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Search" />
              </span>
              <span>
                <Button @click="openCreateModal">{{ $t('app.Create') }}</Button>
              </span>
            </div>
          </template>
          <Column field="image" :header="$t('c_productEditModal.Image')" >
            <template #body="rowData">
              <img :src="getProductImageSrc(rowData.data)" alt="img" class="w-4rem mx-1" />
            </template>
          </Column>
          <Column field="name" :header="$t('c_productEditModal.Name')">
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" />
            </template>
          </Column>
          <Column field="category" :header="$t('c_productEditModal.Category')" >
            <template #editor="{ data, field }">
              <Dropdown
                :placeholder="$t('c_productEditModal.Please select')"
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
          <Column field="priceInclVat" :header="$t('c_productEditModal.Price')">
            <template #editor="{ data }">
              <InputNumber
                v-model="data['editPrice']"
                mode="currency"
                currency="EUR"
                :minFractionDigits="2"
                :maxFractionDigits="2"
              />
            </template>
            <template #body="rowData">
              {{ formatPrice(rowData.data.priceInclVat) }}
            </template>
          </Column>
          <Column field="alcoholPercentage" :header="$t('c_productEditModal.Alcohol Percentage')">
            <template #editor="{ data, field }">
              <InputNumber v-model="data[field]" suffix="%" />
            </template>
            <template #body="rowData">
              {{ `${rowData.data.alcoholPercentage} %` }}
            </template>
          </Column>
          <Column field="vat" :header="$t('c_productEditModal.VAT')">
            <template #editor="{ data, field }">
              <Dropdown
                  :placeholder="$t('c_productEditModal.Please select VAT')"
                  :options="vatGroups"
                  optionLabel="percentage"
                  v-model="data[field]"
              >
                <template #value="slotProps"> {{ `${slotProps.value.percentage} %` }} </template>
              </Dropdown>
            </template>
            <template #body="rowData">
              {{ `${rowData.data.vat.percentage} %` }}
            </template>
          </Column>
          <Column
            :rowEditor="true"
            bodyStyle="text-align:center"
          />
        </DataTable>
        <ProductModalComponent :product="selectedProduct" v-model:visible="visible" />
      </CardComponent>
      <ContainerCardComponent
        v-if="containers"
        :header="$t('manageProducts.Containers')"
        :data="containers"
        class="w-full"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import type { Ref } from 'vue';
import { onBeforeMount, onMounted, ref } from 'vue';
import apiService from '@/services/ApiService';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import type {
  ContainerResponse,
  ContainerWithProductsResponse,
  ProductCategoryResponse,
  ProductResponse,
  VatGroup
} from '@sudosos/sudosos-client';
import type { DataTableRowEditInitEvent, DataTableRowEditSaveEvent } from 'primevue/datatable';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/formatterUtils';
import { FilterMatchMode } from 'primevue/api';
import InputText from 'primevue/inputtext';
import ProductModalComponent from '@/components/ProductCreateComponent.vue';
import Dropdown from 'primevue/dropdown';

import ContainerCardComponent from '@/components/ContainerCardComponent.vue';

const containers: Ref<ContainerWithProductsResponse[]> = ref([]);

onBeforeMount(async () => {});

const products: Ref<ProductResponse[]> = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  category: { value: null, matchMode: FilterMatchMode.EQUALS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const selectedProduct: Ref<ProductResponse | undefined> = ref();
const visible: Ref<Boolean> = ref(false);
const editingRows = ref([]);
const openCreateModal = () => {
  selectedProduct.value = undefined;
  visible.value = true;
};
const vatGroups: Ref<VatGroup[]> = ref([]);
const categories: Ref<ProductCategoryResponse[]> = ref([]);

const rowEditInit = (event: DataTableRowEditInitEvent) => {
  event.data['editPrice'] = (event.data as ProductResponse).priceInclVat.amount / 100;
};

onMounted(async () => {
  products.value = await fetchAllPages<ProductResponse>(
    0,
    Number.MAX_SAFE_INTEGER,
    // @ts-ignore
    (take, skip) => apiService.products.getAllProducts(take, skip)
  );
  const categoriesResp = await apiService.category.getAllProductCategories();
  categories.value = categoriesResp.data.records;
  const vatGroupsResp = await apiService.vatGroups.getAllVatGroups();
  vatGroups.value = vatGroupsResp.data.records;

  // TODO: Put getAllContainers into container store and take care of pagination
  // See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/51
  await apiService.container.getAllContainers(500, 0).then((resp: any) => {
    (resp.data.records as ContainerResponse[]).forEach((container) =>
      apiService.container.getSingleContainer(container.id).then((res) => {
        containers.value.push(res.data as ContainerWithProductsResponse);
      })
    );
  });
});

const updateRow = async (event: DataTableRowEditSaveEvent) => {
  await apiService.products.updateProduct(event.newData.id, {
    name: event.newData.name,
    priceInclVat: {
      amount: event.newData.editPrice * 100,
      currency: 'EUR',
      precision: 2
    },
    vat: event.newData.vat.id,
    category: event.newData.category.id,
    alcoholPercentage: event.newData.alcoholPercentage
  });
  products.value[event.index] = event.newData;
};
</script>

<style scoped lang="scss">
//.product-image {
//  height: 4rem;
//}
//
//.product-table-header {
//  /* background-color: #f8f8f8; */
//  display: flex;
//  flex-direction: row;
//  justify-content: space-between;
//}
//
//.content-wrapper {
//  flex-direction: column;
//}
//
//.container-card {
//  margin-top: 1rem;
//  min-width: 100%;
//  width: 100%
//}
</style>
