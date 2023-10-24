<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { ref } from "vue";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

const authStore = useAuthStore();
const apiKeyMessage = ref();
const toast = useToast();
const { t } = useI18n();


function updateApiKey() {
  authStore.updateUserKey(apiService).then((res) => {
    //Succes
    if(res) {
      toast.add({ severity: "success", summary: "Success", detail: `t('profile.Your new key is')\n ${res.key} \n t('profile.Kay is not saved')` });
    }
  }).catch((err) => {
    //error
    console.log(err);
  });
}


</script>

<template>
  <card-component :header="t('profile.Get api key')">
    <Toast/>
    <div>
      <p>{{ $t('profile.Note old api key will get removed') }}</p>
      <p>{{apiKeyMessage || '&nbsp;'}}</p>
    </div>
    <div>
      <Button severity="danger" :label="t('profile.Get new API key')" @click="updateApiKey" />
    </div>
  </card-component>
</template>

<style scoped>

</style>