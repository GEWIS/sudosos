<template>
  <div class="flex flex-row flex-wrap w-full gap-1 w-full justify-space-between">
    <div v-for="product in container.products" :key="product.id" class="card">
      <ProductComponent :container="container" :product="product" />
    </div>
    <Button class="flex flex-column h-10rem w-8rem border-300
    border-1 border-round-sm overflow-hidden" :outlined="true" @click="visible = true">
      <i class="pi pi-plus text-5xl my-auto product-card"></i>
    </Button>
    <ProductContainerOperationsComponent v-model:visible="visible" :container="props.container"/>
  </div>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse } from "@sudosos/sudosos-client";
import ProductComponent from "@/components/ProductComponent.vue";
import { type Ref, ref, type PropType } from "vue";
import ProductContainerOperationsComponent from "@/components/ProductContainerOperationsComponent.vue";

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
