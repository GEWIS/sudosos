<template>
  <CardComponent :header="t('profile.keyGet')">
    <div>
      <p>{{ $t('profile.keyOldRemoved') }}</p>
      <p>{{apiKeyMessage || '&nbsp;'}}</p>
    </div>
    <div style="margin-top: 1rem" class="flex justify-content-end">
      <Button :label="t('profile.keyGetNew')" @click="updateApiKey" />
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { ref } from "vue";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { handleError } from "@/utils/errorUtils";

const authStore = useAuthStore();
const apiKeyMessage = ref();
const toast = useToast();
const { t } = useI18n();


function updateApiKey() {
  authStore.updateUserKey(apiService).then((res) => {
    //Succes
    if(res) {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: `${t('profile.newKey')} \n ${res.key} \n ${t('profile.keyNotSaved')}`
      });
    }
  }).catch((err) => {
    handleError(err, toast);
  });
}
</script>

<style scoped>

</style>
