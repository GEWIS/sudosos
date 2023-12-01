<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { useField } from "vee-validate";
import apiService from "@/services/ApiService";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import Password from "primevue/password";

const authStore = useAuthStore();
const toast = useToast();
const userStore = useUserStore();
const { t } = useI18n();

let isLocal = false;
if(userStore.getCurrentUser.user) {
  isLocal = (userStore.getCurrentUser.user.type == "LOCAL_USER");
}


//TODO make password greyed when using m account
const { value: inputPassword, errorMessage: inputPasswordError }
  = useField('inputPassword', validatePassword);
const { value: confirmPassword, errorMessage: confirmPasswordError }
  = useField('confirmPassword', validateConfirmPassword);


function validatePassword(checkPassword: string) {
  if (checkPassword.length <8) {
    //TODO set password requirements
    return t('profile.Password should');
  }
  return true;
}

function validateConfirmPassword(checkConfirmPassword: string) {
  if (checkConfirmPassword != inputPassword.value) {
    return t('profile.The passwords to not match up');
  }
  return true;
}

function changePassword() {
  if (validatePassword(inputPassword.value) == true && validateConfirmPassword(confirmPassword.value) == true) {
    authStore.updateUserLocalPassword(inputPassword.value, apiService).then(() => {
      inputPassword.value = "";
      confirmPassword.value = "";
      toast.add({ severity: "success", summary: "success", detail: "" });
    }).catch((err) => {
      console.error(err);
    });
  } else {
    toast.add({ severity: "error", summary: "failed", detail: t('profile.Incorrect passwords submitted'), life: 3000 });
  }
}

</script>

<template>
  <CardComponent :header="t('profile.changePassword')">
    <div>
      <div>
        <p>{{ $t('profile.password') }}</p>
        <Password :disabled="!isLocal"  v-model="inputPassword"/>
        <small class="warning">{{inputPasswordError || '&nbsp;'}}</small>
      </div>
      <div>
        <p>{{ $t('profile.passwordConfirm') }}</p>
        <Password :disabled="!isLocal" v-model="confirmPassword"/>
        <small class="warning">{{confirmPasswordError || '&nbsp;'}}</small>
      </div>
      <div style="margin-top: 1rem">
        <Button
          severity="danger"
          :disabled="!isLocal"
          :label="t('profile.passwordUpdate')"
          @click="changePassword"
        />
      </div>
    </div>
  </CardComponent>
  <Toast />
</template>

<style scoped>

</style>
