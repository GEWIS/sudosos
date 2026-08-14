<template>
  <!-- Grid view (default) -->
  <div v-if="viewMode === 'grid'" class="flex flex-row flex-wrap gap-2 w-full justify-start">
    <div v-for="product in container.products" :key="product.id" class="card">
      <ContainerProductDisplay :container="container" :product="product" />
    </div>
    <Button
      v-if="isAllowed('create', ['own', 'organ'], 'Product', ['any'])"
      class="border border-gray-300 rounded-sm flex flex-col h-40 overflow-hidden w-32 hover:bg-gray-50 transition-colors"
      :outlined="true"
      @click="createVisible = true"
    >
      <i class="m-auto pi pi-plus text-5xl text-gray-600"></i>
    </Button>
    <ProductActionDialog
      v-model:visible="createVisible"
      :container="props.container"
      :is-update-allowed="isAllowed('update', ['own', 'organ'], 'Product')"
    />
  </div>

  <!-- Table view -->
  <div v-else>
    <DataTable size="small" :value="container.products">
      <Column field="image" :header="t('modules.seller.productContainers.products.image')" style="width: 5rem">
        <template #body="{ data }">
          <img
            :alt="data.name"
            :src="getProductImageSrc(data)"
            style="object-fit: contain; height: 3rem; width: 3rem"
          />
        </template>
      </Column>
      <Column field="name" :header="t('common.name')" />
      <Column field="category" :header="t('modules.seller.productContainers.products.category')" style="width: 15%">
        <template #body="{ data }">
          {{ data.category?.name }}
        </template>
      </Column>
      <Column field="priceInclVat" :header="t('common.price')" style="width: 8rem">
        <template #body="{ data }">
          {{ formatPrice(data.priceInclVat) }}
        </template>
      </Column>
      <Column field="vat" :header="t('modules.seller.productContainers.products.vat')" style="width: 5rem">
        <template #body="{ data }"> {{ data.vat != null ? data.vat.percentage + '%' : '' }} </template>
      </Column>
      <Column body-style="text-align: center" field="featured" style="width: 6rem">
        <template #header>
          <span>{{ t('modules.seller.productContainers.products.promo') }}</span>
        </template>
        <template #body="{ data }">
          <Badge v-if="data.featured" severity="danger" :value="t('modules.seller.productContainers.products.promo')" />
        </template>
      </Column>
      <Column body-style="text-align: center" style="width: 5rem">
        <template #body="{ data }">
          <div class="flex gap-3 justify-center">
            <i class="cursor-pointer pi pi-info-circle" @click="openEditDialog(data)" />
            <i
              v-if="isAllowed('update', ['own', 'organ'], 'Container', ['any'])"
              class="cursor-pointer pi pi-trash text-red-500"
              @click="deleteProduct(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <ConfirmDialog :group="confirmGroup" />
    <div v-if="isAllowed('create', ['own', 'organ'], 'Product', ['any'])" class="flex justify-end mt-2">
      <Button icon="pi pi-plus" :label="t('common.create')" size="small" @click="createVisible = true" />
    </div>
    <ProductActionDialog
      v-model:visible="createVisible"
      :container="props.container"
      :is-update-allowed="isAllowed('update', ['own', 'organ'], 'Product')"
    />
    <ProductActionDialog
      v-model:visible="editVisible"
      :container="props.container"
      :is-update-allowed="isAllowed('update', ['own', 'organ'], 'Product')"
      :product="selectedProduct"
    />
  </div>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse, ProductResponse } from '@gewis/sudosos-client';
import { type Ref, ref, type PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import ContainerProductDisplay from '@/components/container/ContainerProductDisplay.vue';
import ProductActionDialog from '@/modules/seller/components/ProductActionDialog.vue';
import { formatPrice } from '@/utils/formatterUtils';
import { getProductImageSrc } from '@/utils/urlUtils';
import { handleError } from '@/utils/errorUtils';
import { useContainerStore } from '@/stores/container.store';

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();
const containerStore = useContainerStore();

const createVisible: Ref<boolean> = ref(false);
const editVisible: Ref<boolean> = ref(false);
const selectedProduct: Ref<ProductResponse | undefined> = ref(undefined);

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
    required: true,
  },
  viewMode: {
    type: String as PropType<'grid' | 'table'>,
    default: 'grid',
  },
});

const confirmGroup = computed(() => `productDelete-${props.container.id}`);

const openEditDialog = (product: ProductResponse) => {
  selectedProduct.value = product;
  editVisible.value = true;
};

const deleteProduct = (product: ProductResponse) => {
  confirm.require({
    group: confirmGroup.value,
    header: t('modules.seller.productContainers.products.productContainerDelete'),
    message: t('modules.seller.productContainers.products.confirmProductContainerDelete'),
    acceptLabel: t('common.remove'),
    rejectLabel: t('common.close'),
    acceptIcon: 'pi pi-trash',
    rejectIcon: 'pi pi-times',
    accept: () => {
      containerStore
        .deleteProductFromContainer(props.container, product)
        .then(() => {
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.productContainerDeleted'),
            severity: 'success',
            life: 3000,
          });
        })
        .catch((err) => handleError(err, toast));
    },
  });
};
</script>

<style scoped></style>
