<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { useField } from "vee-validate";
import apiService from "@/services/ApiService";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

const authStore = useAuthStore();
const toast = useToast();
const userStore = useUserStore();
const { t } = useI18n();

let isLocal = false;
if(userStore.getCurrentUser.user) {
  isLocal = (userStore.getCurrentUser.user.type == "LOCAL_USER");
}


const { value: inputFirstName, errorMessage: inputFirstNameError } = useField('inputFirstName', validateFirstName);
const { value: inputLastName, errorMessage: inputLastNameError } = useField('inputLastName', validateLastName);
const { value: inputEmail, errorMessage: inputEmailError } = useField('inputEmail', validateEmail);


function validateFirstName(checkFirstName: string) {
  if (checkFirstName.length <1) {
    return "name cannot be empty";
  }
  return true;
}

function validateLastName(checkLastName: string) {
  if (checkLastName.length <1) {
    return "name cannot be empty";
  }
  return true;
}

function validateEmail(checkEmail: string) {
  if (!checkEmail.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
    return "no valid email";
  }
  return true;
}

function changeUserInfo() {
  if(validateEmail(inputEmail.value) && validateLastName(inputLastName.value) && validateFirstName(inputFirstName.value)) {
    //TODO update info

  } else {
    toast.add({ severity: "error", summary: "failed", detail: 'fill in correct info', life: 3000 });

  }
}


</script>

<template>
  <card-component :header="'Change user info'">
    <div>
      <small v-if="!isLocal">!This account is not managed trhoug SudoSOS!</small>
      <div>
        <p>FirstName</p>
        <Password :disabled="!isLocal"  v-model="inputFirstName"/>
        <small class="warning">{{inputFirstNameError || '&nbsp;'}}</small>
      </div>
      <div>
        <p>Last name</p>
        <InputText :disabled="!isLocal"  v-model="inputLastName"/>
        <small class="warning">{{inputLastNameError || '&nbsp;'}}</small>
      </div>
      <div>
        <p>Email adress</p>
        <InputText :disabled="!isLocal" v-modal="inputEmail"/>
        <small class="warning">{{inputEmailError || '&nbsp;'}}</small>
      </div>
      <div>
        <Button severity="danger" :disabled="true" label="Update user info" @click="changeUserInfo"/>
      </div>
    </div>
  </card-component>
  <Toast />
</template>

<style scoped>

</style>