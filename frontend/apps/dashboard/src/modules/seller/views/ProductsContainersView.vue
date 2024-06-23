<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_productContainerOperations.Manage Products')}}</div>
    <div class="flex flex-column gap-5">
      <ContainerCard
          v-if="containers"
          :header="$t('manageProducts.Containers')"
          :containers="containers"
          :show-create="true"
          class="w-full"/>
      <ProductCard/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import ContainerCard from '@/components/container/ContainerCard.vue';
import { type ContainerInStore, useContainerStore } from "@/stores/container.store";
import ProductCard from "@/modules/seller/components/ProductCard.vue";

const containerStore = useContainerStore();

const containers = computed<ContainerInStore[]>(() => Object.values(containerStore.getAllContainers));

onBeforeMount(async () => {
  await containerStore.fetchAllIfEmpty();
});

</script>

<style scoped lang="scss">

</style>
