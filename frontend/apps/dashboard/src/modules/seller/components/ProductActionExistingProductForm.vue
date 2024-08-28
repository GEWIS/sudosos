<template>
  <div class="flex gap-5 justify-content-end">
    <p class="prop">{{ $t('c_productContainerOperations.Existing Product') }}</p>
    <Dropdown
        :placeholder="$t('c_ContainerAssign.Select product')"
        :options="products"
        optionLabel="name"
        v-model="selectProduct"
        :filter="true"
        class="w-15rem align-items-center"
    />
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import type { BaseProductResponse } from "@sudosos/sudosos-client";

const selectProduct = defineModel('selectProduct');

const props = defineProps<{
  products: BaseProductResponse[]
}>();

</script>


<style scoped lang="scss">

</style>