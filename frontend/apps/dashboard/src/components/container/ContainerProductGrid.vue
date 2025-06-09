<template>
  <div class="flex flex-row flex-wrap gap-2 w-full justify-start">
    <div v-for="product in container.products" :key="product.id" class="card">
      <ContainerProductDisplay :container="container" :product="product" />
    </div>
    <Button
      v-if="isAllowed('create', ['own', 'organ'], 'Product', ['any'])"
      class="border !border-gray-300 rounded-sm flex flex-col h-40 overflow-hidden w-32 hover:bg-gray-50 transition-colors"
      :outlined="true"
      @click="visible = true"
    >
      <i class="m-auto pi pi-plus text-5xl text-gray-600"></i>
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
