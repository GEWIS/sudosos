<template>
  <div
    class="flex flex-column h-12rem w-8rem border-300 border-1 border-round-sm overflow-hidden cursor-pointer relative"
    @click="visible = true"
  >
      <div class="h-8rem flex justify-content-center align-items-center background-white">
        <img :src="imageSrc" :alt="product.name" class="p-1 h-8rem"/>
      </div>
      <div v-if="product.featured" class="promo-tag uppercase">{{ $t('app.Promo') }}</div>
      <p class="text-center m-2 text-base text-overflow-ellipsis font-bold">{{ product.name }}</p>
  </div>
  <ProductContainerOperationsComponent :container="container" v-model:visible="visible" :product="product"/>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse, ProductResponse } from "@sudosos/sudosos-client";
import { getProductImageSrc } from "@/utils/imageUtils";
import { computed, ref } from "vue";
import ProductContainerOperationsComponent from "@/components/ProductContainerOperationsComponent.vue";

const visible = ref(false);
const imageSrc = computed(() => getProductImageSrc(props.product));

const props = defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
  container: {
    type: Object as () => ContainerWithProductsResponse,
    required: true,
  }
});
</script>

<style scoped lang="scss">
.background-white {
  background-color: #fff; /* Ensuring background is white */
}

.promo-tag {
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  color: #fff;
  font-weight: bolder;
  background-color: rgba(212, 0, 0, 0.5);
  text-align: center;
  font-size: 1.2em;
  padding: 5px 0;
}
</style>
