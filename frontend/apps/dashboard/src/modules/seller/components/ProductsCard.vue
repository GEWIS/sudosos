<template>
  <CardComponent class="w-full" :header="t('modules.seller.productContainers.products.header')">
    <template #topAction>
      <div>
        <Button
          v-if="isAllowed('create', ['own', 'organ'], 'Product')"
          icon="pi pi-plus"
          :label="t('common.create')"
          @click="openCreateModal"
        />
      </div>
    </template>
    <ProductActionDialog
      v-model:visible="visible"
      :is-update-allowed="isAllowed('update', ['own', 'organ'], 'Product')"
      :product="product"
    />
    <DataTable
      v-model:filters="filters"
      filter-display="menu"
      :global-filter-fields="['name']"
      paginator
      :pt="{
        tableContainer: {
          class: `md:min-h-[35rem]`,
        },
      }"
      :rows="5"
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      :value="products"
    >
      <template #header>
        <div class="flex flex-row justify-between">
          <IconField icon-position="left">
            <InputIcon class="pi pi-search"></InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Search" />
          </IconField>
        </div>
      </template>
      <Column field="image" :header="t('modules.seller.productContainers.products.image')">
        <template v-if="!loading" #body="rowDataImg">
          <Image
            class="h-16 w-16 object-contain justify-center"
            preview
            :pt="{
              image: {
                class: 'h-4rem w-4rem',
                style: {
                  'object-fit': 'contain',
                  'box-sizing': 'border-box',
                },
              },
            }"
            :src="getProductImageSrc(rowDataImg.data)"
          />
        </template>
        <template v-else #body>
          <Skeleton class="h-4rem my-1 surface-300 w-8" />
        </template>
      </Column>
      <Column field="name" :header="t('common.name')" style="width: 40%">
        <template v-if="loading" #body>
          <Skeleton class="h-2rem my-1 surface-300 w-6" />
        </template>
      </Column>
      <Column field="category" :header="t('modules.seller.productContainers.products.category')" style="width: 15%">
        <template v-if="!loading" #body="rowData">
          {{ rowData.data.category.name }}
        </template>
        <template v-else #body>
          <Skeleton class="h-2rem my-1 surface-300 w-6" />
        </template>
      </Column>
      <Column field="priceInclVat" :header="t('common.price')" style="width: 17%">
        <template v-if="!loading" #body="rowData">
          {{ formatPrice(rowData.data.priceInclVat) }}
        </template>
        <template v-else #body>
          <Skeleton class="h-2rem my-1 surface-300 w-6" />
        </template>
      </Column>
      <Column field="vat" :header="t('modules.seller.productContainers.products.vat')" style="width: 10%">
        <template v-if="loading" #body>
          <Skeleton class="h-2rem my-1 surface-300 w-6" />
        </template>
        <template v-else #body="rowData">
          {{ `${rowData.data.vat.percentage} %` }}
        </template>
      </Column>
      <Column body-style="text-align:center" style="width: 5%">
        <template v-if="loading" #body>
          <Skeleton class="h-2rem my-1 surface-300 w-3" />
        </template>
        <template v-else #body="rowData">
          <i class="cursor-pointer pi pi-info-circle" @click="() => openEditModal(rowData.data.id)" />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import { computed, onBeforeMount, type Ref, ref } from 'vue';
import type { ProductResponse } from '@sudosos/sudosos-client';
import { FilterMatchMode } from '@primevue/core/api';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import { useProductStore } from '@/stores/product.store';
import ProductActionDialog from '@/modules/seller/components/ProductActionDialog.vue';
import CardComponent from '@/components/CardComponent.vue';
import { formatPrice } from '@/utils/formatterUtils';
import { getProductImageSrc } from '@/utils/urlUtils';

const { t } = useI18n();

const loading: Ref<boolean> = ref(true);
const visible: Ref<boolean> = ref(false);
const product: Ref<ProductResponse | undefined> = ref(undefined);
const productStore = useProductStore();

const products = computed<ProductResponse[]>(() =>
  Object.values(productStore.getAllProducts).sort((a, b) => a.name.localeCompare(b.name)),
);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onBeforeMount(async () => {
  await productStore.fetchAllIfEmpty();
  loading.value = false;
});

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
  background-color: rgba(0, 0, 0, 0.5);
}

.background-white {
  background-color: #fff;
}

.product-image {
  object-fit: contain;
  box-sizing: border-box;
}
</style>
