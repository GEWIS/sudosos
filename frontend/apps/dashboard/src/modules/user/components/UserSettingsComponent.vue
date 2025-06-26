<template>
  <CardComponent :action="undefined" :func="undefined" :header="t('modules.user.settings.header')">
    <div class="flex flex-col gap-2 justify-between">
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.changePassword') }}</p>
        <i
          class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500"
          @click="showPasswordDialog = true"
        />
      </div>
      <Divider />
      <h4 class="mt-0">{{ t('modules.user.settings.nfc') }}</h4>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.changeNFC') }}</p>
        <i class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500" @click="startScan()" />
      </div>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.deleteNFC') }}</p>
        <i class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500" @click="confirmDeleteNFC()" />
      </div>
      <Divider />
      <h4 class="mt-0">{{ t('modules.user.settings.apiKeys') }}</h4>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.changeApiKey') }}</p>
        <i class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500" @click="confirmChangeApiKey()" />
      </div>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.deleteApiKey') }}</p>
        <i class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500" @click="confirmDeleteApiKey()" />
      </div>
      <Divider />
      <h4 class="mt-0">{{ t('modules.user.settings.preferences') }}</h4>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.dataAnalysis') }}</p>
        <ToggleSwitch v-model="dataAnalysis" @update:model-value="handleChangeDataAnalysis" />
      </div>
      <div class="align-items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.enableBeta') }}</p>
        <ToggleSwitch v-model="betaEnabled" @update:model-value="handleChangeEnableBeta" />
      </div>
    </div>
  </CardComponent>
  <!-- @vue-generic {yup.InferType<typeof editPasswordSchema>} -->
  <FormDialog
    v-model="showPasswordDialog"
    :form="passwordForm"
    :header="t('modules.user.settings.changePassword')"
    :is-editable="true"
  >
    <template #form="slotProps">
      <ChangePasswordForm :form="slotProps.form" @submit:success="showPasswordDialog = false" />
    </template>
  </FormDialog>
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import type { UserResponse } from '@sudosos/sudosos-client';
import Divider from 'primevue/divider';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as yup from 'yup';
import CardComponent from '@/components/CardComponent.vue';
import FormDialog from '@/components/FormDialog.vue';
import { editPasswordSchema } from '@/utils/validation-schema';
import { schemaToForm } from '@/utils/formUtils';
import ChangePasswordForm from '@/modules/user/components/forms/ChangePasswordForm.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import { isBetaEnabled } from '@/utils/betaUtil';

async function startScan() {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (!('NDEFReader' in window)) {
    let detail;
    if (isIOS) {
      detail = t('common.toast.error.iosUnsupported');
    } else if (isAndroid) {
      detail = t('common.toast.error.androidUnsupported');
    } else {
      detail = t('common.toast.error.desktopUnsupported');
    }

    toast.add({
      severity: 'error',
      summary: t('common.toast.error.error'),
      detail: detail,
      life: 3000,
    });
  }

  const ndef = new window.NDEFReader();
  await ndef.scan().then(() => {
    toast.add({
      severity: 'info',
      summary: t('common.toast.info.info'),
      detail: t('common.toast.info.scanStarted'),
      life: 3000,
    });
  });

  // Handle the NFC tag when it is detected
  ndef.onreading = async (event: NDEFReadingEvent) => {
    // Extract and log the NFC tag's ID (serial number)
    const nfcCode = event.serialNumber.toLowerCase().replace(/[^a-z0-9]/g, '');

    await apiService.user
      .updateUserNfc(props.user.id, { nfcCode })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.nfcCodeUpdated'),
          life: 3000,
        });
      })
      .catch((err) => {
        handleError(err, toast);
      });
  };
}

const props = defineProps<{
  user: UserResponse;
}>();

const { t } = useI18n();
const showPasswordDialog = ref(false);
const passwordForm = schemaToForm(editPasswordSchema);
const confirm = useConfirm();
const toast = useToast();
const dataAnalysis = ref(props.user.extensiveDataProcessing);
const betaEnabled = ref(isBetaEnabled());
const userStore = useUserStore();

const handleChangeDataAnalysis = (value: boolean) => {
  apiService.user
    .updateUser(props.user.id, { extensiveDataProcessing: value })
    .then(() => {
      dataAnalysis.value = value;
      toast.add({
        severity: 'success',
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.dataAnalysis'),
        life: 5000,
      });
    })
    .catch((err) => {
      handleError(err, toast);
    });
};

const handleChangeEnableBeta = (value: boolean) => {
  document.cookie = 'X-Beta-Enabled=' + value;
  location.reload();
};

const confirmChangeApiKey = () => {
  confirm.require({
    message: t('modules.user.settings.confirmChangeApiKey'),
    header: t('modules.user.settings.changeApiKey'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      userStore
        .fetchUserApi(apiService, props.user.id)
        .then((res) => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: `${t('common.toast.success.apiKeyChanged')} \n ${res.data.key}`,
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
    message: t('modules.user.settings.confirmDeleteApiKey'),
    header: t('modules.user.settings.deleteApiKey'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      apiService.user
        .deleteUserKey(props.user.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.apiKeyDeleted'),
            life: 5000,
          });
        })
        .catch((err) => {
          handleError(err, toast);
        });
    },
  });
};

const confirmDeleteNFC = () => {
  confirm.require({
    message: t('modules.user.settings.confirmDeleteNFC'),
    header: t('modules.user.settings.deleteNFC'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      apiService.user
        .deleteUserNfc(props.user.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.nfcCodeDeleted'),
            life: 5000,
          });
        })
        .catch((err) => {
          handleError(err, toast);
          console.error(err.message);
        });
    },
  });
};
</script>

<style scoped></style>
