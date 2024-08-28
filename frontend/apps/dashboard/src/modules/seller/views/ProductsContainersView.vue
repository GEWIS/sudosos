<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_productContainerOperations.Manage Products')}}</div>
    <div class="flex flex-column gap-5">
      <ContainersCard
          v-if="containers"
          :header="$t('manageProducts.Containers')"
          :containers="containers"
          :show-create="true"
          class="w-full"/>
      <ProductsCard/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import ContainersCard from '@/components/container/ContainersCard.vue';
import { type ContainerInStore, useContainerStore } from "@/stores/container.store";
import ProductsCard from "@/modules/seller/components/ProductsCard.vue";

const containerStore = useContainerStore();

const containers = computed<ContainerInStore[]>(() => Object.values(containerStore.getAllContainers));

onBeforeMount(async () => {
  await containerStore.fetchAllIfEmpty();
});

</script>

<style scoped lang="scss">

</style>
