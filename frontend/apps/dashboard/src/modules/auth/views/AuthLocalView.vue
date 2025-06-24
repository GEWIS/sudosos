<template>
  <div>
    <img alt="logo" class="block max-h-[14rem] mx-auto my-0" src="../../../assets/img/bier.png" />
    <div class="my-6 mx-auto text-5xl text-900 w-full">{{ t('modules.auth.login.sudosos') }}</div>
    <Card>
      <template #content>
        <AuthLocalForm :form="form" />
        <Button
          id="login-button"
          class="items-center flex justify-center mx-auto w-full"
          type="submit"
          @click="formSubmit"
        >
          {{ t('modules.auth.login.login') }}
        </Button>
        <Button class="items-center flex justify-center mx-auto my-3 w-full" :outlined="true" @click="toHomeView">
          {{ t('common.back') }}
        </Button>
        <div class="cursor-pointer text-900 underline" @click="resetPassword">
          {{ t('modules.auth.reset.passwordReset') }}
        </div>
      </template>
    </Card>
  </div>
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

const { t } = useI18n();
const authStore = useAuthStore();
const form = schemaToForm(localAuthForm);

const route = useRoute();

const formSubmit = async () => {
  await form.submit();
};

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
