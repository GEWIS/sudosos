<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { ref } from "vue";

const apiKeyMessage = ref();

function updateApiKey() {


}
</script>

<template>
  <card-component header="'get api key'">
    <div>
      <p>NOTE: If you request a new API key any old ones will be replaced</p>
      <p>{{apiKeyMessage || '&nbsp;'}}</p>
    </div>
    <div>
      <Button severity="danger" label="Get new API key" @click="updateApiKey" />
    </div>
  </card-component>
</template>

<style scoped>

</style>