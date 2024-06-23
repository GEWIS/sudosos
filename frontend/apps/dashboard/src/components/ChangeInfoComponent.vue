<!-- TODO unused? -->
<!-- https://github.com/GEWIS/sudosos-frontend/issues/228 -->
<template>
  <CardComponent :header="$t('profile.changeUserInfo')" :class="{ 'opacity-30': !isLocal}">
    <form @submit="changeUserInfo">
      <small v-if="!isLocal">{{ $t('profile.notManagedThroughSudoSOS') }}</small>
      <div class="field">
        <p>{{ $t('profile.firstName')}}</p>
        <InputText :disabled="!isLocal" v-bind="firstName" />
        <small class="warning">{{errors.firstName || '&nbsp;'}}</small>
      </div>
      <div class="field">
        <p>{{ $t('profile.lastName')}}</p>
        <InputText :disabled="!isLocal" v-bind="lastName" />
        <small class="warning">{{errors.lastName || '&nbsp;'}}</small>
      </div>
      <div class="field">
        <p>{{ $t('profile.emailAddress')}}</p>
        <InputText :disabled="!isLocal" v-bind="email" />
        <small class="warning">{{errors.email || '&nbsp;'}}</small>
      </div>
      <div style="margin-top: 1rem" class="flex justify-content-end">
        <Button :disabled="!isLocal" :label="$t('profile.updateInfo')" type="submit" />
      </div>
    </form>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import { useForm } from "vee-validate";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { simpleUserDetailsSchema } from "@/utils/validation-schema";
import { onBeforeMount } from "vue";
import apiService from "@/services/ApiService";
import { handleError } from "@/utils/errorUtils";

const toast = useToast();
const userStore = useUserStore();
const { t } = useI18n();

let isLocal = false;
if(userStore.getCurrentUser.user) {
  isLocal = (userStore.getCurrentUser.user.type == "LOCAL_USER");
}

const { defineComponentBinds, handleSubmit, errors, setValues } = useForm({
  validationSchema: simpleUserDetailsSchema,
});

const firstName = defineComponentBinds('firstName', {});
const lastName = defineComponentBinds('lastName', {});
const email = defineComponentBinds('email', {});

onBeforeMount(() => {
  setValues({
      firstName: userStore.getCurrentUser.user?.firstName,
      lastName: userStore.getCurrentUser.user?.lastName,
      email: userStore.getCurrentUser.user?.email,
    }
  );
});
const changeUserInfo = handleSubmit(async (values) => {
  if (userStore.getCurrentUser.user) {
    apiService.user.updateUser(userStore.getCurrentUser.user.id, {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
    }).then(() => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: `${t('userDetails.userInfoUpdated')}`,
        life: 3000,
      });
    }).catch((err) => {
      handleError(err, toast);
    });
  }
});


</script>

<style scoped>
.warning {
  color: red; /* Set the error text color to red */
  margin-top: 4px; /* Add some space between the input and the error text */
}
</style>
