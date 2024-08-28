<template>
  <div class="flex flex-row flex-wrap w-full gap-1 w-full justify-space-between">
    <div v-for="product in container.products" :key="product.id" class="card">
      <ContainerProductDisplay :container="container" :product="product" />
    </div>
    <Button class="flex flex-column h-10rem w-8rem border-300
    border-1 border-round-sm overflow-hidden" :outlined="true" @click="visible = true">
      <i class="pi pi-plus text-5xl my-auto product-card"></i>
    </Button>
    <ProductActionDialog v-model:visible="visible" :container="props.container"/>
  </div>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse } from "@sudosos/sudosos-client";
import ContainerProductDisplay from "@/components/container/ContainerProductDisplay.vue";
import { type Ref, ref, type PropType } from "vue";
import ProductActionDialog from "@/modules/seller/components/ProductActionDialog.vue";

let visible: Ref<boolean> = ref(false);
const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
    required: true
  }
});

</script>

<style scoped>
</style>
