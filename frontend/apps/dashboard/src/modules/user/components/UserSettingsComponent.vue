<template>
  <CardComponent
      :header="t('userSettings.userSettings')"
      :func="undefined"
      :action="undefined"
      class="w-full md:w-5"
  >
    <div class="flex flex-column">
      <FormSection
          :header="t('userSettings.changePin')"
          @cancel="pinForm.context.resetForm"
          @save="pinForm.submit"
          :enableEdit="true"
          :simpleSave="true"
          @update:modelValue="editPin = $event"
          divider>
        <ChangePinForm :form="pinForm" :edit="editPin"/>
      </FormSection>
      <div class="flex flex-row align-items-center w-11">
        <p class="flex-grow-1 my-1">{{ t('userSettings.changePassword') }}</p>
        <i
            class="pi pi-arrow-up-right text-gray-500 flex align-items-center cursor-pointer"
            @click="showPasswordDialog = true"
        />
      </div>
      <Divider />
      <h4 class="mt-0">{{ t('userSettings.apiKeys') }}</h4>
      <div class="flex flex-row align-items-center w-11">
        <p class="flex-grow-1 my-1">{{ t('userSettings.changeApiKey') }}</p>
        <i
            class="pi pi-arrow-up-right text-gray-500 flex align-items-center cursor-pointer"
            @click="confirmChangeApiKey()"
        />
      </div>
      <div class="flex flex-row align-items-center w-11">
        <p class="flex-grow-1 my-1">{{ t('userSettings.deleteApiKey') }}</p>
        <i
            class="pi pi-arrow-up-right text-gray-500 flex align-items-center cursor-pointer"
            @click="confirmDeleteApiKey()"
        />
      </div>
      <Divider />
      <h4 class="mt-0">{{ t('userSettings.preferences') }}</h4>
      <div class="flex flex-row align-items-center w-11">
        <p class="flex-grow-1 my-0">{{ t('userSettings.dataAnalysis') }}</p>
        <InputSwitch
            @update:modelValue="handleChangeDataAnalysis"
            v-model="dataAnalysis"
        />
      </div>
    </div>
  </CardComponent>
  <FormDialog
      v-model="showPasswordDialog"
      :form="passwordForm"
      :header="t('userSettings.changePassword')"
  >
    <template #form="slotProps">
      <ChangePasswordForm :form="slotProps.form" @submit:success="showPasswordDialog = false"/>
    </template>
  </FormDialog>
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { type PropType, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { UserResponse } from "@sudosos/sudosos-client";
import { defineProps } from "vue";
import CardComponent from "@/components/CardComponent.vue";
import Divider from "primevue/divider";
import InputSwitch from "primevue/inputswitch";
import ChangePinForm from "@/modules/user/components/forms/ChangePinForm.vue";
import FormDialog from "@/components/FormDialog.vue";
import { editPasswordSchema, editPinSchema } from "@/utils/validation-schema";
import { schemaToForm } from "@/utils/formUtils";
import FormSection from "@/components/FormSection.vue";
import ChangePasswordForm from "@/modules/user/components/forms/ChangePasswordForm.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import apiService from "@/services/ApiService";
import { handleError } from "@/utils/errorUtils";

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
});

const { t } = useI18n();
const showPasswordDialog = ref(false);
const pinForm = schemaToForm(editPinSchema);
const passwordForm = schemaToForm(editPasswordSchema);
const editPin = ref(true);
const confirm = useConfirm();
const toast = useToast();
const dataAnalysis = ref(props.user.extensiveDataProcessing);

const handleChangeDataAnalysis = (value: boolean) => {
  apiService.user.updateUser(props.user.id, { extensiveDataProcessing: value })
      .then(() => {
        dataAnalysis.value = value;
        toast.add({
          severity: "success",
          summary: t('successMessages.success'),
          detail: t('successMessages.dataAnalysisChanged'),
          life: 5000,
        });
      })
      .catch((err) => {
        handleError(err, toast);
      });
};

const confirmChangeApiKey = () => {
  confirm.require({
    message: t('userSettings.confirmChangeApiKey'),
    header: t('userSettings.changeApiKey'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      apiService.user.updateUserKey(props.user.id)
          .then((res) => {
            toast.add({
              severity: "success",
              summary: t('successMessages.success'),
              detail: `${t('successMessages.apiKeyChanged')} \n ${res.data.key}`,
              life: 5000,
            });
          })
          .catch((err) => {
            handleError(err, toast);
          });
    },
  });
};

const confirmDeleteApiKey = () => {
  confirm.require({
    message: t('userSettings.confirmDeleteApiKey'),
    header: t('userSettings.deleteApiKey'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      apiService.user.deleteUserKey(props.user.id)
          .then(() => {
            toast.add({
              severity: "success",
              summary: t('successMessages.success'),
              detail: t('successMessages.apiKeyDeleted'),
              life: 5000,
            });
          })
          .catch((err) => {
            handleError(err, toast);
          });
    },
  });
};

</script>

<style scoped></style>
