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
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // Import the useRoute function from vue-router

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

:deep(.p-button){
  margin: 0 5px !important;
}
</style>