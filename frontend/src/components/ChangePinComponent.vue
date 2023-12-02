<template>
  <CardComponent :header="$t('profile.pinChange')">
    <form id="update-pin-form" @submit="changeUserPin">
      <div>
        <p>{{ $t('profile.pinNew')}}</p>
        <InputText v-bind="pin" />
        <small class="warning">{{errors.pin || '&nbsp;'}}</small>
      </div>
      <div>
        <p>{{ $t('profile.pinConfirm')}}</p>
        <InputText v-bind="pinConfirm" />
        <small class="warning">{{errors.pinConfirm || '&nbsp;'}}</small>
      </div>
      <div style="margin-top: 1rem">
        <Button severity="danger" type="submit" :label="t('profile.pinChange')" />
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
import { editPinSchema } from "@/utils/validation-schema";
import { handleError } from "@/utils/errorUtils";

const userStore = useUserStore();
const toast = useToast();
const { t } = useI18n();
const { defineComponentBinds, handleSubmit, errors } = useForm({
  validationSchema: editPinSchema,
});

const pin = defineComponentBinds('pin', {});
const pinConfirm = defineComponentBinds('pinConfirm', {});

const changeUserPin = handleSubmit(async (values) => {
  if (userStore.getCurrentUser.user) {
    apiService.user.updateUserPin(
      userStore.getCurrentUser.user.id,
      { pin: values.pinConfirm })
      .then(() => {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: `${t('passwordUpdated')}`,
          life: 3000,
        });
      })
      .catch((err) => {
        handleError(err, toast);
      });
  }
});

</script>



<style scoped>

</style>
