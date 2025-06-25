<template>
  <div class="flex items-center gap-5 justify-end">
    <span class="text-base">{{ t('modules.seller.productContainers.products.addExisting') }}</span>
    <Select
      v-model="selectProduct"
      class="max-w-[15rem]"
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
