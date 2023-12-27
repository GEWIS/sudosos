<template>
  <div class="grid">
    <!-- Loop through each product and render a card for each -->
    <div v-for="product in products" :key="product.id" class="card">
      <ProductComponent :product="product" />
    </div>
    <Button class="text-center m-2 w-8rem flex-column align-items-center h-10rem" @click="visible = true">
      <i class="pi pi-plus text-5xl my-auto product-card"></i>
    </Button>
    <ContainerAssignProductDialog v-model:visible="visible" v-model:products="products" :container="props.container"/>
  </div>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse, ProductResponse } from "@sudosos/sudosos-client";
import ProductComponent from "@/components/ProductComponent.vue";
import ContainerAssignProductDialog from "@/components/ContainerAssignProductDialog.vue";
import { type Ref, ref, type PropType } from "vue";

let visible: Ref<boolean> = ref(false);

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
    required: true
  }
});

const products: Ref<ProductResponse[]> = ref(props.container.products)

</script>

<style scoped>
</style>
