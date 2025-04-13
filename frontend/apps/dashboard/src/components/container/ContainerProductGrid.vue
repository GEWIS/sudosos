<template>
  <div class="flex flex-row flex-wrap gap-1 justify-space-between w-full w-full">
    <div v-for="product in container.products" :key="product.id" class="card">
      <ContainerProductDisplay :container="container" :product="product" />
    </div>
    <Button
      v-if="isAllowed('create', ['own', 'organ'], 'Product', ['any'])"
      class="border-1 border-300 border-round-sm flex flex-column h-10rem overflow-hidden w-8rem"
      :outlined="true"
      @click="visible = true"
    >
      <i class="my-auto pi pi-plus product-card text-5xl"></i>
    </Button>
    <ProductActionDialog
      v-model:visible="visible"
      :container="props.container"
      :is-update-allowed="isAllowed('update', ['own', 'organ'], 'Product')"
    />
  </div>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse } from '@sudosos/sudosos-client';
import { type Ref, ref, type PropType } from 'vue';
import ContainerProductDisplay from '@/components/container/ContainerProductDisplay.vue';
import ProductActionDialog from '@/modules/seller/components/ProductActionDialog.vue';
import { isAllowed } from '@/utils/permissionUtils';

const visible: Ref<boolean> = ref(false);
const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
    required: true,
  },
});
</script>

<style scoped></style>
