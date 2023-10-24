<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { ref } from "vue";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import { useToast } from "primevue/usetoast";

const authStore = useAuthStore();
const apiKeyMessage = ref();
const toast = useToast();

function updateApiKey() {
  authStore.updateUserKey(apiService).then((res) => {
    //Succes
    if(res) {
      toast.add({ severity: "success", summary: "New api key", detail: `your new key is :\n ${res.key} \n Copy now as we do not save this raw data` });
    }
  }).catch((err) => {
    //error
    console.log(err);
  });
}


</script>

<template>
  <card-component header="'get api key'">
    <Toast/>
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