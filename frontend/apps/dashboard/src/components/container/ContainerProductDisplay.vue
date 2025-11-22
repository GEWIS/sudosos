<template>
  <div
    class="border border-gray-300 rounded-sm cursor-pointer flex flex-col h-48 overflow-hidden relative w-32 hover:shadow-md transition-shadow"
    @click="visible = true"
  >
    <div class="bg-white flex items-center justify-center h-32">
      <img :alt="product.name" class="h-full object-contain p-1" :src="imageSrc" />
    </div>
    <div
      v-if="product.featured"
      class="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 uppercase"
    >
      {{ t('modules.seller.productContainers.products.promo') }}
    </div>
    <p class="font-bold mx-2 my-1 text-base text-center truncate">{{ product.name }}</p>
  </div>
  <ProductActionDialog
    v-model:visible="visible"
    :container="container"
    :is-update-allowed="isAllowed('update', ['own', 'organ'], 'Product')"
    :product="product"
  />
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse, ProductResponse } from '@sudosos/sudosos-client';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import { getProductImageSrc } from '@/utils/urlUtils';
import ProductActionDialog from '@/modules/seller/components/ProductActionDialog.vue';

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
  },
});

const { t } = useI18n();
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
