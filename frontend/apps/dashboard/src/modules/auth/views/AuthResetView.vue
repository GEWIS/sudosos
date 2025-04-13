<template>
  <div>
    <img alt="logo" class="block max-h-9rem mx-auto my-0" src="../../../assets/img/bier.png" />
    <div class="mb-2 mt-0 mx-auto text-5xl text-900 w-full">{{ t('modules.auth.reset.reset') }}</div>
    <form v-if="passwordResetMode === 0" class="flex flex-column" @submit="resetPasswordRequest">
      <span class="p-float-label with-error">
        <InputText
          v-bind="email"
          id="email"
          class="input-field"
          :class="{ 'p-invalid': emailForm.errors.value.email }"
          name="email"
          size="large"
        />
        <label :class="{ 'contains-text': email.modelValue }" for="email">
          {{ t('modules.auth.reset.enterEmail') }}
        </label>
      </span>
      <small v-if="emailForm.errors.value.email" class="p-error">
        <i class="pi pi-exclamation-circle" />
        {{ emailForm.errors.value.email }}
      </small>
      <Button id="reset-button" type="submit">{{ t('modules.auth.reset.reset') }}</Button>
      <div class="cursor-pointer text-900 underline" @click="backToLogin">
        {{ t('modules.auth.reset.backToLogin') }}
      </div>
    </form>
    <div v-else-if="passwordResetMode === 1" class="login-form">
      <div class="text-900">{{ t('modules.auth.reset.emailSent') }}</div>
      <div class="cursor-pointer text-900 underline" @click="backToLogin">
        {{ t('modules.auth.reset.backToLogin') }}
      </div>
    </div>
    <form v-else class="login-form" @submit="setNewPassword">
      <span class="p-float-label with-error">
        <InputText
          v-bind="password"
          id="password"
          class="input-field"
          :class="{ 'p-invalid': passwordForm.errors.value.password }"
          name="password"
          size="large"
          type="password"
        />
        <label :class="{ 'contains-text': password.modelValue }" for="password">
          {{ t('modules.auth.reset.newPassword') }}
        </label>
      </span>
      <small v-if="passwordForm.errors.value.password" class="p-error">
        <i class="pi pi-exclamation-circle" />
        {{ passwordForm.errors.value.password }}
      </small>
      <span class="p-float-label with-error">
        <InputText
          v-bind="passwordConfirm"
          id="passwordConfirm"
          class="input-field"
          :class="{ 'p-invalid': passwordForm.errors.value.passwordConfirm }"
          name="passwordConfirm"
          size="large"
          type="password"
        />
        <label :class="{ 'contains-text': passwordConfirm.modelValue }" for="passwordConfirm">
          {{ t('modules.auth.reset.confirmPassword') }}
        </label>
      </span>
      <small v-if="passwordForm.errors.value.passwordConfirm" class="p-error">
        <i class="pi pi-exclamation-circle" />
        {{ passwordForm.errors.value.passwordConfirm }}
      </small>
      <Button id="reset-button" type="submit">{{ t('modules.auth.reset.reset') }}</Button>
      <div class="cursor-pointer text-900 underline" @click="backToLogin">
        {{ t('modules.auth.reset.backToLogin') }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import * as yup from 'yup';
import { toTypedSchema } from '@vee-validate/yup';
import { useI18n } from 'vue-i18n';
import { handleError } from '@/utils/errorUtils';
import router from '@/router';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const toast = useToast();

const emailSchema = toTypedSchema(
  yup.object({
    email: yup.string().email().required(),
  }),
);

const atLeastOneUppercase = /^(?=.*[A-Z])/;
const atLeastOneLowercase = /^(?=.*[a-z])/;
const atLeastOneDigit = /^(?=.*\d)/;
const atLeastOneSpecialChar = /^(?=.*[@$!%*?&])/;
const allowedCharacters = /^[A-Za-z\d@$!%*?& ]{8,}$/;

const passwordSchema = toTypedSchema(
  yup.object({
    password: yup
      .string()
      .required('This is a required field')
      .matches(atLeastOneUppercase, 'At least one uppercase letter is required')
      .matches(atLeastOneLowercase, 'At least one lowercase letter is required')
      .matches(atLeastOneDigit, 'At least one digit is required')
      .matches(atLeastOneSpecialChar, 'At least one special character is required')
      .matches(allowedCharacters, 'Password must be at least 8 characters long and only contain allowed characters'),
    passwordConfirm: yup
      .string()
      .required('This is a required field')
      .oneOf([yup.ref('password')], 'Passwords do not match'),
  }),
);

const emailForm = useForm({
  validationSchema: emailSchema,
});

const passwordForm = useForm({
  validationSchema: passwordSchema,
});

const passwordResetMode = ref(0);
const email = emailForm.defineComponentBinds('email');
const password = passwordForm.defineComponentBinds('password');
const passwordConfirm = passwordForm.defineComponentBinds('passwordConfirm');

const route = useRoute();

onBeforeMount(() => {
  if (route.query.token !== undefined && route.query.email !== undefined) {
    passwordResetMode.value = 2;
  }
});

const resetPasswordRequest = emailForm.handleSubmit(async (values) => {
  await apiService.authenticate.resetLocal({ accountMail: values.email }).then(() => {
    passwordResetMode.value = 1;
  });
});

const setNewPassword = passwordForm.handleSubmit(async (values) => {
  await apiService.authenticate
    .resetLocalWithToken({
      accountMail: route.query.email as string,
      token: route.query.token as string,
      password: values.password,
    })
    .then(() => {
      backToLogin();
      toast.add({
        severity: 'success',
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.resetPasswordSuccess'),
        life: 3000,
      });
    })
    .catch((err) => handleError(err, toast));
});

const backToLogin = () => {
  void router.push({ name: 'local' });
};
</script>

<style scoped lang="scss">
//TODO Cleanup and fix, related to issue #14 and #25
.p-button {
  margin: 1rem auto;
  max-width: 350px;
  width: 100%;
  max-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.p-error {
  display: block;
  font-size: 12px;
  text-align: left;
  line-height: 18px;
}

.p-error > i {
  font-size: 12px;
  margin-right: 3.6px;
  line-height: 12px;
}

.input-field {
  width: 100%;
  padding-top: 18px;
  padding-left: 12px;
  padding-bottom: 0;
  height: 60px;
}

.p-float-label label {
  top: 30%;
  margin-top: 0;
  left: 12px;
}

.contains-text,
.p-float-label input:focus ~ label,
.p-float-label label ~ input:focus {
  margin-top: 0;
  top: 8px !important;
}

.p-invalid {
  background-color: #fef0f0;
}

.p-inputtext {
  margin-bottom: 0.5rem;
}
</style>
