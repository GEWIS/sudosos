<template>
  <AuthLocalCard :header="t('modules.auth.login.sudosos')">
    <AuthLocalForm :form="form" />
    <Button class="items-center flex justify-center mx-auto my-3 w-full" :outlined="true" @click="toHomeView">
      {{ t('common.back') }}
    </Button>
    <div class="cursor-pointer text-900 underline" @click="resetPassword">
      {{ t('modules.auth.reset.passwordReset') }}
    </div>
  </AuthLocalCard>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onBeforeMount } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import apiService from '@/services/ApiService';
import { schemaToForm } from '@/utils/formUtils';
import { localAuthForm } from '@/utils/validation-schema';
import AuthLocalForm from '@/modules/auth/components/forms/AuthLocalForm.vue';
import AuthLocalCard from '@/modules/auth/components/AuthLocalCard.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const form = schemaToForm(localAuthForm);

const route = useRoute();

onBeforeMount(() => {
  if (route.query.token !== undefined) {
    const token = route.query.token as string;
    authStore.gewisWebLogin(crypto.randomUUID(), token, apiService).catch(() => {
      void router.replace({ path: '/error' });
    });
  }
});

const resetPassword = () => {
  void router.push({ name: 'passwordreset' });
};

const toHomeView = () => {
  void router.push(sessionStorage.getItem('fromPath') || { name: 'home' });
  sessionStorage.removeItem('fromPath');
};
</script>

<style scoped lang="scss"></style>
