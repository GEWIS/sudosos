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

    <card-component :header="'Change password'" :action="'Update password'" :func="changePassword">
      <div>
        <div>
          <p>Password</p>
          <Password v-model="inputPassword"/>
          <small class="warning">{{inputPasswordError || '&nbsp;'}}</small>
        </div>
        <div>
          <p>Confirm password</p>
          <InputText type="password" v-model="confirmPassword"/>
          <small class="warning">{{confirmPasswordError || '&nbsp;'}}</small>
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

const authStore = useAuthStore();
const toast = useToast();


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


function changePinCode() {
  if (validatePin(inputPin.value) == true && validateConfirmPin(confirmPin.value) == true) {
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

const { value: inputPassword, errorMessage: inputPasswordError} = useField('inputPassword', validatePassword);
const { value: confirmPassword, errorMessage: confirmPasswordError} = useField('confirmPassword', validateConfirmPassword);

function validatePassword(checkPassword: string) {
  if (checkPassword.length <12) {
    //TODO set password requirements
    return "length should be at least 12"
  }
  return true;
}

function validateConfirmPassword(checkConfirmPassword: string) {
  if (checkConfirmPassword != inputPassword.value) {
    return "Both passwords should match"
  }
  return true;
}

function changePassword() {
  if (validatePassword(inputPassword.value) == true && validateConfirmPassword(confirmPassword.value) == true) {
    //authStore.updateUserPassword()
  } else {
    toast.add({severity: "error", summary: "failed", detail: 'fill in correct passwords', life: 3000})
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