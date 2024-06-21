<template>
  <CardComponent :header="$t('c_productContainerOperations.AllProducts')" class="w-full">
    <template #topAction>
      <div>
        <Button @click="openCreateModal">{{ $t('app.Create') }}</Button>
      </div>
    </template>
    <ProductContainerOperationsComponent v-model:visible="visible" :product="product"/>
    <DataTable
        v-model:filters="filters"
        :value="products"
        paginator
        tableStyle="min-width: 50rem"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        filterDisplay="menu"
        :globalFilterFields="['name']"
        :pt="{
                  table: {
                    style: 'table-layout: fixed; width: 100%;'
                  }
              }"
    >
      <template #header>
        <div class="flex flex-row justify-content-between">
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search"></InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Search"/>
          </IconField>
        </div>
      </template>
      <Column field="image" :header="$t('c_productContainerOperations.Image')">
        <template #body="rowDataImg" v-if="!loading">
          <div
              class="h-4rem flex justify-content-center align-items-center background-white
                   w-4rem mx-1 cursor-pointer image-preview-container">
            <div class="h-4rem w-4rem">
              <img :src="getProductImageSrc(rowDataImg.data)" alt="img" class="h-4rem w-4rem product-image"/>
            </div>
            <button
                ref="previewButton"
                type="button"
                class="image-preview-indicator p-image-preview-indicator fileupload"
                @click="triggerFileInput(rowDataImg.data.id)"
            >
              <i class="pi pi-upload"></i>
              <input
                  :ref="(el) => (fileInputs[rowDataImg.data.id] = el)"
                  type="file"
                  accept="image/*"
                  id="fileInput"
                  @change="(e) => onImgUpload(e, rowDataImg.data.id)"
              />
            </button>
          </div>
        </template>
        <template #body v-else>
          <Skeleton class="w-8 my-1 h-4rem surface-300"/>
        </template>
      </Column>
      <Column field="name" :header="$t('c_productContainerOperations.Name')" style="width: 30%">
        <template #body v-if="loading">
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="category" :header="$t('c_productContainerOperations.Category')" style="width: 15%">
        <template #body="rowData" v-if="!loading">
          {{ rowData.data.category.name }}
        </template>
        <template #body v-else>
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="priceInclVat" :header="$t('c_productContainerOperations.Price')" style="width: 17%">
        <template #body="rowData" v-if="!loading">
          {{ formatPrice(rowData.data.priceInclVat) }}
        </template>
        <template #body v-else>
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="alcoholPercentage"
              :header="$t('c_productContainerOperations.Alcohol Percentage')" style="width: 10%">
        <template #body="rowData" v-if="!loading">
          {{ `${rowData.data.alcoholPercentage} %` }}
        </template>
        <template #body v-else>
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="vat" :header="$t('c_productContainerOperations.VAT')" style="width: 10%">
        <template #body v-if="loading">
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
        <template #body="rowData" v-else>
          {{ `${rowData.data.vat.percentage} %` }}
        </template>

      </Column>
      <Column
          bodyStyle="text-align:center"
          style="width: 5%"
      >
        <template #body v-if="loading">
          <Skeleton class="w-3 my-1 h-2rem surface-300"/>
        </template>
        <template #body="rowData" v-else>
          <Button
              @click="openEditModal(rowData.data.id)"
              type="button"
              outlined
              icon="pi pi-pencil"
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { getProductImageSrc } from "@/utils/imageUtils";
import { formatPrice } from "@/utils/formatterUtils";
import IconField from "primevue/iconfield";
import CardComponent from "@/components/CardComponent.vue";
import InputIcon from "primevue/inputicon";
import Column from "primevue/column";
import Skeleton from "primevue/skeleton";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import { computed, onBeforeMount, type Ref, ref } from "vue";
import type { ProductResponse } from "@sudosos/sudosos-client";
import { useProductStore } from "@/stores/product.store";
import { FilterMatchMode } from "primevue/api";
import ProductContainerOperationsComponent from "@/components/ProductContainerOperationsComponent.vue";

const loading: Ref<boolean> = ref(true);
const visible: Ref<Boolean> = ref(false);
const product: Ref<ProductResponse | undefined> = ref(undefined);
const fileInputs: Ref<{ [key: number]: any }> = ref({});

const productStore = useProductStore();

const products = computed<ProductResponse[]>(() => Object.values(productStore.getAllProducts)
    .sort((a, b) => a.name.localeCompare(b.name)));

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onBeforeMount(async () => {
  await productStore.fetchAllIfEmpty();
  loading.value = false;
});

const triggerFileInput = (id: number) => {
  if (fileInputs.value[id]) {
    fileInputs.value[id].click();
  }
};
const onImgUpload = async (event: Event, productId: number) => {
  const el = (event.target as HTMLInputElement);
  if (el == null || el.files == null || el.files.length === 0) return;
  await productStore.updateProductImage(productId, el.files[0]);
};

const openCreateModal = () => {
  product.value = undefined;
  visible.value = true;
};

const openEditModal = (id: number) => {
  product.value = productStore.getSingleProduct(id);
  visible.value = true;
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

.background-white {
  background-color: #fff;
}

.product-image {
  object-fit: contain;
  box-sizing: border-box;
}
</style>
