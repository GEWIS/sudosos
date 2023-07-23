<template>
  <CardComponent header="Points of Sale">
    <DataTable :value="pos">
      <Column field="title" header="Title"/>
      <Column field="owner" header="Owner"/>
      <Column field="containerAmount" header="Containers"/>
      <Column headerStyle="width: 3rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
        <template #body="slotProps">
          <Button @click="$router.push({name: 'pointOfSaleInfo', params: {id: slotProps.data.id}})" type="button" severity='danger' icon="pi pi-info-circle" outlined />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>
<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {onMounted, ref} from "vue";
import {useUserStore} from "@sudosos/sudosos-frontend-common";
import {usePointOfSaleStore} from "@/stores/pos.store";
const userStore = useUserStore();
const pointOfSaleStore = usePointOfSaleStore();


onMounted(() => {
  const userId = userStore.getCurrentUser.user.id;
  console.error(userId);
  pointOfSaleStore.getUserPointsOfSale(userId).then((resp)=>console.log(resp));
  pos.value = [
    {
      title: "Point of Sale 1",
      owner: "BAC",
      containerAmount: 87,
      id: 0,
    },
    {
      title: "Point of Sale 2",
      owner: "GEWIS",
      containerAmount: 3,
      id: 1,
    },
    {
      title: "Point of Sale 3",
      owner: "I.V.V",
      containerAmount: 2,
      id: 2,
    },
  ];
});
const pos = ref();
</script>

<style scoped lang="scss">
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f8f8;
  border-top: none;
  text-transform: uppercase;
  font-family: Lato,Arial,sans-serif!important;
  font-size: 1rem;
  padding: 0.375rem 0;
  line-height: 1.5;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: #f8f8f8;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  font-family: Lato,Arial,sans-serif!important;
}
</style>
