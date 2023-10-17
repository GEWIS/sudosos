<template>
  <div>
    <main>
      <img id="reset-image" src="../assets/img/bier.png" alt="logo"/>
      <h1>{{ $t('login.Reset') }}</h1>
      <Form v-if="passwordResetMode === 0" class="login-form" @submit="resetPasswordRequest">
        <span class="p-float-label with-error">
          <InputText
              v-bind="email"
              id="email"
              size="large"
              name="email"
              :class="{'p-invalid': emailForm.errors.value.email}"
          />
          <label :class="{'contains-text': email.modelValue }" for="email">{{ $t('login.Enter email') }}</label>
        </span>
        <small
            v-if="emailForm.errors.value.email"
            class="p-error"
        >
          <i class="pi pi-exclamation-circle"/>
          {{ emailForm.errors.value.email }}
        </small>
        <Button type="submit" id="reset-button" severity="danger">{{ $t('login.Reset') }}</Button>
        <div class="backtologin" @click="backToLogin">{{ $t('login.Back to login') }}</div>
      </Form>
      <div v-else-if="passwordResetMode === 1" class="login-form">
        <div class="sent-email">{{ $t('login.Email sent') }}</div>
        <div class="backtologin" @click="backToLogin">{{ $t('login.Back to login') }}</div>
      </div>
      <Form v-else class="login-form" @submit="setNewPassword">
        <span class="p-float-label with-error">
          <InputText
              v-bind="password"
              id="password"
              size="large"
              name="password"
              type="password"
              :class="{'p-invalid': passwordForm.errors.value.password}"
          />
          <label :class="{'contains-text': password.modelValue }" for="password">{{ $t('login.New password') }}</label>
        </span>
        <small
            v-if="passwordForm.errors.value.password"
            class="p-error"
        >
          <i class="pi pi-exclamation-circle"/>
          {{ passwordForm.errors.value.password }}
        </small>
        <span class="p-float-label with-error">
          <InputText
              v-bind="passwordConfirm"
              id="passwordConfirm"
              size="large"
              name="passwordConfirm"
              type="password"
              :class="{'p-invalid': passwordForm.errors.value.passwordConfirm}"
          />
          <label :class="{'contains-text': passwordConfirm.modelValue }" for="passwordConfirm">
            {{ $t('login.Confirm password') }}
          </label>
        </span>
        <small
            v-if="passwordForm.errors.value.passwordConfirm"
            class="p-error"
        >
          <i class="pi pi-exclamation-circle"/>
          {{ passwordForm.errors.value.passwordConfirm }}
        </small>
        <Button type="submit" id="reset-button" severity="danger">{{ $t('login.Reset') }}</Button>
        <div class="backtologin" @click="backToLogin">{{ $t('login.Back to login') }}</div>
      </Form>
    </main>
    <CopyrightBanner/>
  </div>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate';
import CopyrightBanner from "@/components/CopyrightBanner.vue";
import apiService from "@/services/ApiService";
import router from "@/router";
import { useForm } from "vee-validate";
import InputText from "primevue/inputtext";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import * as yup from "yup";
import { toTypedSchema } from "@vee-validate/yup";

const emailSchema = toTypedSchema(
    yup.object({
      email: yup
          .string()
          .email()
          .required(),
    })
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
          .required("This is a required field")
          .matches(atLeastOneUppercase, 'At least one uppercase letter is required')
          .matches(atLeastOneLowercase, 'At least one lowercase letter is required')
          .matches(atLeastOneDigit, 'At least one digit is required')
          .matches(atLeastOneSpecialChar, 'At least one special character is required')
          .matches(allowedCharacters,
              'Password must be at least 8 characters long and only contain allowed characters'),
      passwordConfirm: yup
          .string()
          .required("This is a required field")
          .oneOf([yup.ref("password")], "Passwords do not match"),
    })
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

onBeforeMount(async () => {
  if (route.query.token !== undefined && route.query.email !== undefined) {
    passwordResetMode.value = 2;
  }
});

const resetPasswordRequest = emailForm.handleSubmit(async () => {
  await apiService.authenticate.resetLocal({ accountMail: email.value.modelValue })
      .then(() => {
        passwordResetMode.value = 1;
      });
});

const setNewPassword = passwordForm.handleSubmit(async () => {
  await apiService.authenticate.resetLocalWithToken({
    accountMail: route.query.email as string,
    token: route.query.token as string,
    password: password.value.modelValue as string,
  }).then();
});

const backToLogin = () => {
  router.push({ name: 'login' });
};

</script>

<style scoped lang="scss">
//TODO Cleanup and fix, related to issue #14 and #25
form {
  display: flex;
  flex-direction: column;
}

h1 {
  color: black;
  max-width: 350px;
  width: 100%;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
}

#reset-image {
  max-height: 150px;

  display: block;
  margin: 0 auto;
}

main {
  display: flex;
  flex-direction: column;
  text-align: center;
  max-width: 350px;
  margin: 4rem auto;
}

.p-button {
  margin: 1rem auto;
  max-width: 350px;
  width: 100%;
  max-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#gewis-branding {
  max-height: 24px;
  margin-right: 1rem;
}

.p-error {
  display: block;
  font-size: 12px;
  text-align: left;
  line-height:18px;
}

.p-error > i {
  font-size:12px;
  margin-right: 3.6px;
  line-height:12px;
}

#email {
  width: 100%;
  padding-top: 18px;
  padding-left: 12px;
  padding-bottom: 0;
  height: 60px;
}

#password {
  width: 100%;
  padding-top: 18px;
  padding-left: 12px;
  padding-bottom: 0;
  height: 60px;
}

#passwordConfirm {
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

.contains-text, .p-float-label input:focus ~ label,  .p-float-label label ~ input:focus {
  margin-top: 0;
  top: 8px!important;
}

.p-invalid {
  background-color: #fef0f0;
}

.p-inputtext {
  margin-bottom: 0.5rem;
}

.sent-email {
  color: black;
}

.backtologin {
  color: black;
  text-decoration-line: underline;
}
</style>
