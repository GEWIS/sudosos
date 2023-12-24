<template>
  <CardComponent :header="t('profile.changePassword')" :class="{ 'opacity-30': !isLocal}">
    <form @submit="changeUserPassword">
      <div class="field">
        <p>{{ $t('profile.password') }}</p>
        <InputText type="password" id="password" :disabled="!isLocal"  v-bind="password"/>
        <small class="warning">{{errors.password || '&nbsp;'}}</small>
      </div>
      <div class="field">
        <p>{{ $t('profile.passwordConfirm') }}</p>
        <InputText type="password" id="passwordConfirm" :disabled="!isLocal" v-bind="passwordConfirm"/>
        <small class="warning">{{errors.passwordConfirm || '&nbsp;'}}</small>
      </div>
      <div style="margin-top: 1rem">
        <Button
          :disabled="!isLocal"
          :label="t('profile.passwordUpdate')"
          type="submit"
        />
      </div>
    </form>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { useForm } from "vee-validate";
import apiService from "@/services/ApiService";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { editPasswordSchema } from "@/utils/validation-schema";
import { handleError } from "@/utils/errorUtils";

const toast = useToast();
const userStore = useUserStore();
const { t } = useI18n();
const { defineComponentBinds, handleSubmit, errors } = useForm({
  validationSchema: editPasswordSchema,
});

const password = defineComponentBinds('password', {});
const passwordConfirm = defineComponentBinds('passwordConfirm', {});

let isLocal = false;
if(userStore.getCurrentUser.user) {
  isLocal = (userStore.getCurrentUser.user.type == "LOCAL_USER");
}

const changeUserPassword = handleSubmit(async (values) => {
  if (userStore.getCurrentUser.user) {
    apiService.user.updateUserLocalPassword(
      userStore.getCurrentUser.user?.id, { password: values.password }).then(() => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: `${t('passwordUpdated')}`,
        life: 3000,
      });}).catch((err) => handleError(err, toast));}});

</script>



<style scoped>
.warning {
  color: red; /* Set the error text color to red */
  margin-top: 4px; /* Add some space between the input and the error text */
}
</style>
