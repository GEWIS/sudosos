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
    return t('profile.Pin code must be 4 digits');
  }
  return true;
};

//show warning message if conformation pin does not fit pin
function validateConfirmPin(checkConfirmPin: string){
  if (checkConfirmPin != inputPin.value) {
    return t('profile.Conformation does not match pin code');
  }
  return true;
}


function changePinCode() {
  if (validatePin(inputPin.value) == true && validateConfirmPin(confirmPin.value) == true) {
    authStore.updateUserPin(inputPin.value, apiService).then(() => {
      //   Succes!
      inputPin.value="";
      confirmPin.value="";
      toast.add({ severity: "success", summary: "success", detail: t('profile.Pin code updated')  });
    }).catch((err) => {
      // Error
      console.error(err);
    });
  } else {
    toast.add({ severity: "error", summary: "failed", detail: t('profile.Incorrect pin code submitted'), life: 3000 });
  }
}

</script>

<template>
  <card-component :header="$t('profile.Change pin code')">
    <Toast />

    <div id="update-pin-form">
      <div>
        <p>{{ $t('profile.New pin code')}}</p>
        <PinComponent v-model="inputPin" />
        <small class="warning">{{inputPinError || '&nbsp;'}}</small>
      </div>
      <div>
        <p>{{ $t('profile.Confirm new pin code')}}</p>
        <PinComponent v-model="confirmPin" />
        <small class="warning">{{confirmPinError || '&nbsp;'}}</small>
      </div>
      <div>
        <Button severity="danger" @click="changePinCode" :label="t('profile.Change pin code')" />
      </div>
    </div>
  </card-component>
</template>

<style scoped>

</style>
