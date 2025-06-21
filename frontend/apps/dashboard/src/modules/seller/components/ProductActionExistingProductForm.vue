<template>
  <div class="flex gap-5 justify-end">
    <p class="prop">{{ t('modules.seller.productContainers.products.addExisting') }}</p>
    <Select
      v-model="selectProduct"
      class="items-center w-15rem"
      :filter="true"
      option-label="name"
      :options="products"
      :placeholder="t('modules.seller.forms.product.select')"
    />
  </div>
</template>

<script setup lang="ts">
import type { BaseProductResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const selectProduct = defineModel<BaseProductResponse>('selectProduct');

defineProps<{
  products: BaseProductResponse[];
}>();
</script>

<style scoped lang="scss"></style>
