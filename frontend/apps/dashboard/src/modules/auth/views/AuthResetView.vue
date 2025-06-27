<template>
  <AuthLocalCard :header="t('modules.auth.reset.reset')">
    <template v-if="passwordResetMode === ResetMode.Request">
      <AuthRequestForm :form="requestForm" @success="passwordResetMode = ResetMode.EmailSent" />
    </template>
    <template v-else-if="passwordResetMode === ResetMode.EmailSent">
      <div class="text-900 my-7">{{ t('modules.auth.reset.emailSent') }}</div>
    </template>
    <template v-else-if="passwordResetMode === ResetMode.SetNew">
      <AuthResetForm :form="resetForm" @success="backToLogin" />
    </template>
    <div class="cursor-pointer text-900 underline my-3" @click="backToLogin">
      {{ t('modules.auth.reset.backToLogin') }}
    </div>
  </AuthLocalCard>
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
import AuthLocalCard from '@/modules/auth/components/AuthLocalCard.vue';

const { t } = useI18n();
const route = useRoute();

const requestForm = schemaToForm(authRequestSchema);
const resetForm = schemaToForm(authResetSchema);

enum ResetMode {
  Request,
  EmailSent,
  SetNew,
}

const passwordResetMode = ref<ResetMode>(ResetMode.Request);

onBeforeMount(() => {
  const token = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token;
  const email = Array.isArray(route.query.email) ? route.query.email[0] : route.query.email;

  if (token && email) {
    resetForm.context.setFieldValue('token', token);
    resetForm.context.setFieldValue('email', email);
    passwordResetMode.value = ResetMode.SetNew;
  }
});

const backToLogin = () => {
  void router.push({ name: 'local' });
};
</script>

<style scoped lang="scss"></style>
