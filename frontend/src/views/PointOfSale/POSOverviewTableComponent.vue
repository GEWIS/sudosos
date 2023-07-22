<template>
  <CardComponent header="Points of Sale">
    <DataTable :value="pos">
      <Column field="title" header="Title"/>
      <Column field="owner" header="Owner"/>
      <Column field="containerAmount" header="Containers"/>
    </DataTable>
  </CardComponent>
</template>
<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {onMounted, ref} from "vue";

const pos = ref([]);

onMounted(() => {
  pos.value = [
    {
      title: "Point of Sale 1",
      owner: "BAC",
      containerAmount: 87,
    },
    {
      title: "Point of Sale 2",
      owner: "GEWIS",
      containerAmount: 3,
    },
    {
      title: "Point of Sale 3",
      owner: "I.V.V",
      containerAmount: 2,
    },
  ];
});
</script>