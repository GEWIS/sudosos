<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_productContainerOperations.Manage Products')}}</div>
    <div class="flex flex-column gap-5">
      <ContainerCardComponent
          v-if="containers"
          :header="$t('manageProducts.Containers')"
          :containers="containers"
          :show-create="true"
          class="w-full"/>
      <ProductCardComponent/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import ContainerCardComponent from '@/components/ContainerCardComponent.vue';
import { type ContainerInStore, useContainerStore } from "@/stores/container.store";
import ProductCardComponent from "@/components/ProductCardComponent.vue";

const containerStore = useContainerStore();

const containers = computed<ContainerInStore[]>(() => Object.values(containerStore.getAllContainers));

onBeforeMount(async () => {
  await containerStore.fetchAllIfEmpty();
});

</script>

<style scoped lang="scss">

</style>
