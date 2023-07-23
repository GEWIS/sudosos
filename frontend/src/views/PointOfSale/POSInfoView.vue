<template>
  <div class="page-container">
    <div class="page-title" id="pos-info-header">
      <span>{{ id }}</span>
      <div>
        <Button severity="secondary" label="Edit" icon="pi pi-pencil"/>
        <Button severity="danger" label="Close" icon="pi pi-times"/>
      </div>
    </div>
    <hr>
    <div class="content-wrapper">
      <div class="pos-row">
        <div class="pos-general-info">
          <h3>General</h3>
          <b>Title</b>
          <p>Point of Sale 1</p>
          <b>Owner</b>
          <p>BAC</p>
        </div>
        <ContainerCardComponent class="container-card"/>
      </div>
      <TransactionsTableComponent header="transactions" class="pos-transactions" />
    </div>
  </div>
</template>


<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import ContainerCardComponent from "@/views/PointOfSale/ContainerCardComponent.vue";
import TransactionsTableComponent from "@/components/TransactionsTableComponent.vue"; // Import the useRoute function from vue-router

const route = useRoute(); // Use the useRoute function to access the current route
const id = ref();
onMounted(() => {
  // Get the 'id' parameter from the route and store it in the 'id' variable
  console.log(route.params);
  id.value = route.params.id; // TODO: Implement API Getter for the POS in question

});
</script>

<style scoped lang="scss">
@import "@/styles/BasePage.css";

#pos-info-header {
  display: flex;
  justify-content: space-between;
}

hr {
  margin: 1rem 0;
}

:deep(.p-button){
  margin: 0 5px !important;
}

.pos-row {
  display: flex;
  width: 100%;
}

.pos-general-info {
  flex: 1;
  padding-left: 0.25rem!important;
  font-family: Lato,Arial,sans-serif!important;

  color: black;
  font-size: 1rem;
  h3 {
    font-size: 1.75rem;
    font-family: Raleway, sans-serif!important;
    margin-bottom: 0.5rem;
  }

  b {
    font-weight: bolder;
  }

  p {
    margin-bottom: 1rem;
  }
}

.container-card {
  flex: 3;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
}

.pos-transactions {
  width: 100%;
  margin-top: 3rem;
}
</style>
