<template>
  <div class="page-container">
    <Toast />

    <div class="page-title">{{ $t('profile.my profile')}}</div>

    <card-component :header="$t('profile.change pin code')" :action="$t('profile.change pin code')" :func="changePinCode" class="change-pin-code" >
      <div id="update-pin-form">
        <div>
          <p>{{ $t('profile.new pin code')}}</p>
          <PinComponent v-model="inputPin"/>
          <small class="warning">{{inputPinError || '&nbsp;'}}</small>
        </div>
        <div>
          <p>{{ $t('profile.confirm new pin code')}}</p>
          <PinComponent v-model="confirmPin" />
          <small class="warning">{{confirmPinError || '&nbsp;'}}</small>
        </div>
      </div>
    </card-component>


  </div>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import {watch, ref} from "vue";
import PinComponent from "@/components/PinComponent.vue";
import {useAuthStore} from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import {useToast} from "primevue/usetoast";
import { useField } from 'vee-validate';

const { value: inputPin, errorMessage: inputPinError } = useField('inputPin', validatePin);
const { value: confirmPin, errorMessage: confirmPinError} = useField('confirmPin', validateConfirmPin);


//show warning message if pin is filled in and not 4 digits
function validatePin(checkInputPin: string){
  if (checkInputPin.length != 4 && !RegExp('\\d{4}').test(checkInputPin)) {
    return "your pin needs to have 4 digits";
  }
  return true;
}

//show warning message if conformation pin does not fit pin
function validateConfirmPin(checkConfirmPin: string){
  if (checkConfirmPin != inputPin.value) {
    return "both pins need to be the same";
  }
  return true;
}


const authStore = useAuthStore();
const toast = useToast();
const changePinCode = () => {
  if (inputPin.value.length == 4 && RegExp('\\d{4}').test(inputPin.value) && inputPin.value == confirmPin.value) {
    authStore.updateUserPin(inputPin.value, apiService).then(() => {
      //   Succes!
      inputPin.value="";
      confirmPin.value="";
      toast.add({severity: "success", summary: "success", detail: 'pin updated successful'  })
    }).catch((err) => {
      // Error
      console.error(err);
    })
  } else {
    toast.add({severity: "error", summary: "failed", detail: 'fill in correct pin codes', life: 3000})
  }
}

</script>

<style scoped>
@import "../styles/BasePage.css";

.warning {
  color: red;
  font-size: 75%;
}

</style>