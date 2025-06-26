<template>
  <div>
    <img alt="logo" class="block max-h-[9rem] mx-auto my-0" src="../../../assets/img/bier.png" />
    <div class="mb-2 mt-0 mx-auto text-5xl text-900 w-full">{{ t('modules.auth.reset.reset') }}</div>
    <AuthRequestForm v-if="passwordResetMode === 0" :form="requestForm" @success="passwordResetMode = 1" />
    <div v-else-if="passwordResetMode === 1">
      <div class="text-900">{{ t('modules.auth.reset.emailSent') }}</div>
    </div>
    <AuthResetForm v-if="passwordResetMode === 2" :form="resetForm" @success="backToLogin" />
    <div class="cursor-pointer text-900 underline" @click="backToLogin">
      {{ t('modules.auth.reset.backToLogin') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import AuthRequestForm from '@/modules/auth/components/forms/AuthRequestForm.vue';
import { authRequestSchema, authResetSchema } from '@/utils/validation-schema';
import { schemaToForm } from '@/utils/formUtils';
import AuthResetForm from '@/modules/auth/components/forms/AuthResetForm.vue';

const { t } = useI18n();

const requestForm = schemaToForm(authRequestSchema);
const resetForm = schemaToForm(authResetSchema);
const passwordResetMode = ref(0);

const route = useRoute();

onBeforeMount(() => {
  const token = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token;
  const email = Array.isArray(route.query.email) ? route.query.email[0] : route.query.email;

  if (token && email) {
    resetForm.context.setFieldValue('token', token);
    resetForm.context.setFieldValue('email', email);
    passwordResetMode.value = 2;
  }
});

const backToLogin = () => {
  void router.push({ name: 'local' });
};
</script>

<style scoped lang="scss"></style>
