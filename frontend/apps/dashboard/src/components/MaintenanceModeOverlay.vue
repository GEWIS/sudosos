<template>
  <div
    v-if="isMaintenance && !canOverride"
    class="fixed top-0 left-0 w-full h-full flex text-white justify-center items-center z-10 bg-red-700"
  >
    <main>
      <img alt="logo" class="block mx-auto mb-5 max-h-[25rem]" src="@/assets/img/bier_grayscale.png" />
      <div class="font-bold text-3xl text-center">{{ t('common.maintenanceMode.title') }}</div>
      <div class="text-2xl text-center">{{ t('common.maintenanceMode.subtitle') }}</div>
      <div class="text-center mt-5">
        <a v-if="!showLogin" class="block text-center underline cursor-pointer" @click="toggleShowLogin">
          {{ t('common.maintenanceMode.adminLogin') }}
        </a>
        <div v-else>
          <Card>
            <template #content>
              <AuthLocalForm :form="form" />
            </template>
          </Card>
          <a class="block text-center underline cursor-pointer mt-2" @click="toggleShowLogin">
            {{ t('common.maintenanceMode.cancelLogin') }}
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useIsMaintenance } from '@/composables/isMaintenance';
import AuthLocalForm from '@/modules/auth/components/forms/AuthLocalForm.vue';
import { schemaToForm } from '@/utils/formUtils';
import { localAuthForm } from '@/utils/validation-schema';

const { t } = useI18n();
const router = useRouter();
const { isMaintenance, canOverride } = useIsMaintenance();
const form = schemaToForm(localAuthForm);

const showLogin = ref(false);

watch(
  () => isMaintenance.value,
  () => {
    // Force logout when the maintenance mode is enabled
    if (isMaintenance.value && !canOverride.value) {
      useAuthStore().logout();
      void router.push({ name: 'login' });
    }
  },
);

const toggleShowLogin = () => {
  showLogin.value = !showLogin.value;
  if (!showLogin.value) {
    form.context.resetForm();
  }
};
</script>

<style scoped lang="scss"></style>
