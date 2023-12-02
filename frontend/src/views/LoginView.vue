<template>
  <div>
    <main>
      <img id="login-image" src="@/assets/img/bier.png" alt="logo" />
      <h1>{{ $t('login.SudoSOS Login') }}</h1>
      <Button id="login-gewis-button" @click="loginViaGEWIS" severity="success">
        <img id="gewis-branding" src="@/assets/img/gewis-branding.svg" alt="GEWIS" />
        {{ $t('login.Login via GEWIS') }}
      </Button>
      <hr />
      <form id="login-form" @submit="loginHandler">
        <label id="input-description" for="username">
          {{ $t('login.Username') }}
        </label>
        <span class="p-float-label with-error">
          <InputText
            id="username"
            type="text"
            v-bind="username"
            size="large"
            name="username"
            :class="{ 'p-invalid': loginForm.errors.value.username }"
          />
          <label :class="{ 'contains-text': username.modelValue }" for="username"
            >{{ $t('login.Username') }}
          </label>
          <small class="p-error">
            <i v-if="loginForm.errors.value.username" class="pi pi-exclamation-circle" />
            {{ loginForm.errors.value.username }}
          </small>
        </span>
        <label id="input-description" for="password">
          {{ $t('login.Password') }}
        </label>
        <span class="p-float-label with-error">
          <InputText
            id="password"
            type="password"
            v-bind="password"
            size="large"
            name="password"
            :class="{ 'p-invalid': loginForm.errors.value.password }"
          />
          <label :class="{ 'contains-text': password.modelValue }" for="password"
            >{{ $t('login.Password') }}
          </label>
          <smal class="p-error">
            <i v-if="loginForm.errors.value.password" class="pi pi-exclamation-circle" />
            {{ loginForm.errors.value.password }}
          </smal>
        </span>
        <Button type="submit" id="login-button" severity="danger">
          {{ $t('login.Login') }}
        </Button>
        <div class="password-reset" @click="resetPassword">
          {{ $t('login.Password reset') }}
        </div>
      </form>
    </main>
    <CopyrightBanner />
  </div>
</template>

<script setup lang="ts">
import CopyrightBanner from '@/components/CopyrightBanner.vue';
import { useRoute } from 'vue-router';
import { onBeforeMount } from 'vue';
import { useUserStore, useAuthStore } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';
import router from '@/router';
import { v4 as uuid } from 'uuid';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { AxiosError } from 'axios';
import { handleError } from "@/utils/errorUtils";

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const schema = toTypedSchema(
  yup.object({
    username: yup.string().required('This is a required field.'),
    password: yup.string().required('This is a required field.')
  })
);
const loginForm = useForm({
  validationSchema: schema
});

const username = loginForm.defineComponentBinds('username');
const password = loginForm.defineComponentBinds('password');

const route = useRoute();

onBeforeMount(() => {
  if (route.query.token !== undefined) {
    const token = route.query.token as string;
    authStore.gewisWebLogin(uuid(), token, apiService).catch(() => {
      router.replace({ path: "/error" });
    });
  }
});

const loginHandler = loginForm.handleSubmit(async (values) => {
  try {
    if (values.username.includes('@')) {
      await apiService.authenticate.localAuthentication({
        accountMail: values.username,
        password: values.password
      }).then((res) => authStore.handleResponse(res.data, apiService));
      if (authStore.getUser) {
        await userStore.fetchCurrentUserBalance(authStore.getUser.id, apiService);
      } else {
        await router.replace({ path: '/error' });
      }
      toHomeView();
    } else {
      await authStore.gewisLdapLogin(values.username, values.password, apiService);
      if (authStore.getUser) {
        await userStore.fetchCurrentUserBalance(authStore.getUser.id, apiService);
      } else {
        await router.replace({ path: '/error' });
      }
      toHomeView();
    }
  } catch (err) {
    handleError(err as AxiosError, toast);
  }
});

// TODO: fix the GEWIS login
// See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/32
const loginViaGEWIS = () => {
  window.location.href = `https://gewis.nl/token/${import.meta.env.VITE_APP_GEWIS_TOKEN}`;
};

const resetPassword = () => {
  router.push({ name: 'passwordreset' });
};

const toHomeView = () => {
  router.push({ name: 'home' });
};
</script>

<style scoped lang="scss">
//TODO Fix the amount of css used related to #14 and #29
form {
  display: flex;
  flex-direction: column;
}

h1 {
  color: black;
  max-width: 350px;
  width: 100%;
  margin: 0 auto;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

#login-image {
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
  line-height: 18px;
  min-height: 25px;
}

.p-error > i {
  font-size: 12px;
  margin-right: 3.6px;
  line-height: 12px;
}

#username {
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

#input-description {
  color: black;
}

.p-invalid {
  background-color: #fef0f0;
}

.p-inputtext {
  margin-bottom: 0.5rem;
}

hr {
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  max-width: 350px;
  width: 100%;
}

.p-inputtext {
  margin-bottom: 0.5rem;
}
.password-reset {
  color: black;
  text-decoration-line: underline;
}
</style>
