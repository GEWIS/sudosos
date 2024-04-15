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
          :pt="{
              table: {
                style: 'table-layout: fixed; width: 100%;'
              }
          }"
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
            <template #editor="rowData">
              <span class="w-4rem h-4rem mx-1 cursor-pointer image-preview-container">
                <img class="w-4rem h-4rem" :src="getProductImageSrc(rowData.data)"/>
                <button
                  ref="previewButton"
                  type="button"
                  class="image-preview-indicator p-image-preview-indicator fileupload"
                  @click="fileInput.click()"
                >
                  <i class="pi pi-upload"></i>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="(e: Event) => onImgUpload(e, (rowData.data as ProductResponse).id)"
                  />
                </button>
              </span>
            </template>
            <template #body="rowData">
              <img :src="getProductImageSrc(rowData.data)" alt="img" class="w-4rem h-4rem mx-1" />
            </template>
          </Column>
          <Column field="name" :header="$t('c_productEditModal.Name')" style="width: 35%">
            <template #editor="{ data, field }">
              <InputText
                v-model="data[field]"
                :pt="{
                  root: {
                    class: 'm-1',
                    style: 'width: 99%;'
                  },

                }"
                />
            </template>
          </Column>
          <Column field="category" :header="$t('c_productEditModal.Category')" style="width: 15%">
            <template #editor="{ data, field }">
              <Dropdown
                :placeholder="$t('c_productEditModal.Please select')"
                optionLabel="name"
                :options="categories"
                v-model="data[field]"
                :pt="{
                  input: 'w-full pt-1 pb-1',
                  root: 'm-1'
                }"
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
          <Column field="priceInclVat" :header="$t('c_productEditModal.Price')"  style="width: 10%">
            <template #editor="{ data }">
              <InputNumber
                v-model="data['editPrice']"
                mode="currency"
                currency="EUR"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                :pt="{
                  input: {
                    root: 'w-full pt-2 pb-2 m-1'
                  }
                }"
              />
            </template>
            <template #body="rowData">
              {{ formatPrice(rowData.data.priceInclVat) }}
            </template>
          </Column>
          <Column field="alcoholPercentage" :header="$t('c_productEditModal.Alcohol Percentage')" style="width: 6%">
            <template #editor="{ data, field }">
              <InputNumber
                v-model="data[field]"
                suffix="%"
                :pt="{
                  input: {
                    root: 'w-full pt-2 pb-2 m-1'
                  }
                }"
                />
            </template>
            <template #body="rowData">
              {{ `${rowData.data.alcoholPercentage} %` }}
            </template>
          </Column>
          <Column field="vat" :header="$t('c_productEditModal.VAT')" style="width: 8%">
            <template #editor="{ data, field }">
              <Dropdown
                  :placeholder="$t('c_productEditModal.Please select VAT')"
                  :options="vatGroups"
                  optionLabel="percentage"
                  v-model="data[field]"
                  :pt="{
                    input: 'w-full pt-1 pb-1' ,
                    root: 'm-1'
                  }"
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
            style="width: 16%"
          />
        </DataTable>
        <ProductCreateComponent v-model:visible="visible" @productCreated="handleNewProduct"/>
      </CardComponent>
      <ContainerCardComponent
        v-if="containers"
        :header="$t('manageProducts.Containers')"
        :containers="containers"
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
  VatGroupResponse
} from '@sudosos/sudosos-client';
import type { DataTableRowEditInitEvent, DataTableRowEditSaveEvent } from 'primevue/datatable';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/formatterUtils';
import { FilterMatchMode } from 'primevue/api';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

import ContainerCardComponent from '@/components/ContainerCardComponent.vue';
import ProductCreateComponent from "@/components/ProductCreateComponent.vue";

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
const fileInput = ref();
const openCreateModal = () => {
  selectedProduct.value = undefined;
  visible.value = true;
};
const vatGroups: Ref<VatGroupResponse[]> = ref([]);
const categories: Ref<ProductCategoryResponse[]> = ref([]);

const rowEditInit = (event: DataTableRowEditInitEvent) => {
  event.data['editPrice'] = (event.data as ProductResponse).priceInclVat.amount / 100;
};

const handleNewProduct = async () => {
  products.value = await fetchAllPages<ProductResponse>(
    0,
    Number.MAX_SAFE_INTEGER,
    // @ts-ignore
    (take, skip) => apiService.products.getAllProducts(take, skip)
  );
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

const onImgUpload = async (event: Event, productId: number) => {
  const el = (event.target as HTMLInputElement);
  if(el == null || el.files == null) return;
  await apiService.products.updateProductImage(productId, el.files[0]);
  handleNewProduct();
};
</script>

<style scoped lang="scss">

.image-preview-container {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.image-preview-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border: none;
  padding: 0;
}

.fileupload > input[type='file'],
.fileupload-basic input[type='file'] {
  display: none;
}

.image-preview-container:hover > .image-preview-indicator {
  opacity: 1;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5)
}
</style>
