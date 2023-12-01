<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import PinComponent from "@/components/PinComponent.vue";
import { useField } from "vee-validate";
import apiService from "@/services/ApiService";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();


const { value: inputPin, errorMessage: inputPinError } = useField('inputPin', validatePin);
const { value: confirmPin, errorMessage: confirmPinError } = useField('confirmPin', validateConfirmPin);



//show warning message if pin is filled in and not 4 digits
function validatePin(checkInputPin: string){
  if (checkInputPin.length != 4 && !RegExp('\\d{4}').test(checkInputPin)) {
    return t('profile.pinIncorrectLength');
  }
  return true;
};

//show warning message if conformation pin does not fit pin
function validateConfirmPin(checkConfirmPin: string){
  if (checkConfirmPin != inputPin.value) {
    return t('profile.pinNotMatch');
  }
  return true;
}


function changePinCode() {
  if (validatePin(inputPin.value) == true && validateConfirmPin(confirmPin.value) == true) {
    authStore.updateUserPin(inputPin.value, apiService).then(() => {
      //   Succes!
      inputPin.value="";
      confirmPin.value="";
      toast.add({ severity: "success", summary: "success", detail: t('profile.pinUpdated')  });
    }).catch((err) => {
      // Error
      console.error(err);
    });
  } else {
    toast.add({ severity: "error", summary: "failed", detail: t('profile.pinIncorrect'), life: 3000 });
  }
}

</script>

<template>
  <CardComponent :header="$t('profile.pinChange')">
    <Toast />

    <div id="update-pin-form">
      <div>
        <p>{{ $t('profile.pinNew')}}</p>
        <PinComponent v-model="inputPin" />
        <small class="warning">{{inputPinError || '&nbsp;'}}</small>
      </div>
      <div>
        <p>{{ $t('profile.pinConfirm')}}</p>
        <PinComponent v-model="confirmPin" />
        <small class="warning">{{confirmPinError || '&nbsp;'}}</small>
      </div>
      <div style="margin-top: 1rem">
        <Button severity="danger" @click="changePinCode" :label="t('profile.pinChange')" />
      </div>
    </div>
  </CardComponent>
</template>

<style scoped>

</style>
