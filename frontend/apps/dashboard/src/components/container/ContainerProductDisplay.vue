<template>
  <div
    class="border-1 border-300 border-round-sm cursor-pointer flex flex-column h-12rem overflow-hidden relative w-8rem"
    @click="visible = true"
  >
    <div class="align-items-center background-white flex h-8rem justify-content-center">
      <img :alt="product.name" class="h-8rem p-1" :src="imageSrc" />
    </div>
    <div v-if="product.featured" class="promo-tag uppercase">
      {{ t('modules.seller.productContainers.products.promo') }}
    </div>
    <p class="font-bold m-2 text-base text-center text-overflow-ellipsis">{{ product.name }}</p>
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
import { getProductImageSrc } from '@/utils/urlUtils';
import ProductActionDialog from '@/modules/seller/components/ProductActionDialog.vue';
import { isAllowed } from '@/utils/permissionUtils';

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
