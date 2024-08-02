<template>
  <CardComponent :header="$t('app.Points of Sale')" class="w-full">
    <DataTable :value="listOfPOS">
      <Column field="name" :header="$t('c_POSCreate.Title')">
        <template #body v-if="isLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="owner.firstName" :header="$t('c_POSCreate.Owner')">
        <template #body v-if="isLoading">
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column headerStyle="width: 3rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
        <template #body v-if="isLoading">
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
        <template #body="slotProps" v-else>
          <Button
              @click="router.push({name: 'pointOfSaleInfo', params: {id: slotProps.data.id}})"
              type="button"
              icon="pi pi-info-circle"
              outlined
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>
<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, type Ref, ref } from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { usePointOfSaleStore } from "@/stores/pos.store";
import type { PointOfSaleResponse } from "@sudosos/sudosos-client";
import Skeleton from "primevue/skeleton";
import router from "@/router";
const userStore = useUserStore();
const pointOfSaleStore = usePointOfSaleStore();
const listOfPOS: Ref<Array<PointOfSaleResponse>> = ref(new Array(10));
const isLoading: Ref<boolean> = ref(true);

onMounted(async () => {
  const userId = userStore.getCurrentUser.user !== null ? userStore.getCurrentUser.user.id : undefined;
  if (userId){
    listOfPOS.value = await pointOfSaleStore.getUserPointsOfSale(userId).then((resp)=> {return resp.data.records;});
  }
  isLoading.value = false;
});

</script>

<style scoped lang="scss">
</style>
