<template>
  <div class="page-container">
    <div class="page-title">Create Point of Sale</div>
    <hr>
    <div class="content-wrapper">
      <div class="pos-general-info">
        <h3>General</h3>
        <b>Title</b>
        <p>Test</p>
        <b>Owner</b>
        <p>Test</p>
      </div>
      <ContainerCardComponent
          class="container-card"
          v-if="pos && pos.containers"
          :data="pos.containers"
          editMode
      />
    </div>
  </div>
</template>

<script setup lang="ts">

import ContainerCardComponent from "@/views/PointOfSale/ContainerCardComponent.vue";
import {onMounted} from "vue";

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