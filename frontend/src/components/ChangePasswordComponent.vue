<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { useField } from "vee-validate";
import apiService from "@/services/ApiService";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";

const authStore = useAuthStore();
const toast = useToast();
const userStore = useUserStore();

let isLocal = false;
if(userStore.getCurrentUser.user) {
  isLocal = (userStore.getCurrentUser.user.type == "LOCAL_USER");
}


//TODO make password greyed when using m account
const { value: inputPassword, errorMessage: inputPasswordError } = useField('inputPassword', validatePassword);
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword', validateConfirmPassword);


function validatePassword(checkPassword: string) {
  if (checkPassword.length <12) {
    //TODO set password requirements
    return "length should be at least 12";
  }
  return true;
}

function validateConfirmPassword(checkConfirmPassword: string) {
  if (checkConfirmPassword != inputPassword.value) {
    return "Both passwords should match";
  }
  return true;
}

function changePassword() {
  if (validatePassword(inputPassword.value) == true && validateConfirmPassword(confirmPassword.value) == true) {
    authStore.updateUserLocalPassword(inputPassword.value, apiService).then(() => {
      inputPassword.value = "";
      confirmPassword.value = "";
      toast.add({ severity: "success", summary: "succes", detail: "" });
    });
    //TODO call the password update
  } else {
    toast.add({ severity: "error", summary: "failed", detail: 'fill in correct passwords', life: 3000 });
  }
}

</script>

<template>
  <card-component :header="'Change password'">
    <div>
      <small v-if="!isLocal">!Only local users can change their password!</small>
      <div>
        <p>Password</p>
        <Password :disabled="!isLocal"  v-model="inputPassword"/>
        <small class="warning">{{inputPasswordError || '&nbsp;'}}</small>
      </div>
      <div>
        <p>Confirm password</p>
        <InputText :disabled="!isLocal" type="password" v-model="confirmPassword"/>
        <small class="warning">{{confirmPasswordError || '&nbsp;'}}</small>
      </div>
      <div>
        <Button severity="danger" :disabled="!isLocal" label="Update Password" @click="changePassword"/>
      </div>
    </div>
  </card-component>
  <Toast />
</template>

<style scoped>

</style>