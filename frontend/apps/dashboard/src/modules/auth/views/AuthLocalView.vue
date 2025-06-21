<template>
  <div>
    <img alt="logo" class="block max-h-[14rem] mx-auto my-0" src="../../../assets/img/bier.png" />
    <div class="my-6 mx-auto text-5xl text-900 w-full">{{ t('modules.auth.login.sudosos') }}</div>
    <Card>
      <template #content>
        <form class="flex flex-col" @submit="loginHandler">
          <span class="p-float-label with-error">
            <InputText
              v-bind="username"
              class="cinput h-4rem pb-0 pt-2 w-full"
              :class="{ 'p-invalid': loginForm.errors.value.username }"
              name="username"
              size="large"
              type="text"
            />
            <label :class="{ 'contains-text': username.modelValue }" for="username"
              >{{ t('modules.auth.login.username') }}
            </label>
            <small class="p-error">
              <i v-if="loginForm.errors.value.username" class="pi pi-exclamation-circle" />
              {{ loginForm.errors.value.username }}
            </small>
          </span>
          <span class="p-float-label with-error">
            <InputText
              v-bind="password"
              class="cinput h-4rem pb-0 pt-2 w-full"
              :class="{ 'p-invalid': loginForm.errors.value.password }"
              name="password"
              size="large"
              type="password"
            />
            <label :class="{ 'contains-text': password.modelValue }" for="password"
              >{{ t('modules.auth.login.password') }}
            </label>
            <small class="p-error">
              <i v-if="loginForm.errors.value.password" class="pi pi-exclamation-circle" />
              {{ loginForm.errors.value.password }}
            </small>
          </span>
          <Button id="login-button" class="items-center flex justify-center mx-auto w-full" type="submit">
            {{ t('modules.auth.login.login') }}
          </Button>
          <Button class="items-center flex justify-center mx-auto my-3 w-full" :outlined="true" @click="toHomeView">
            {{ t('common.back') }}
          </Button>
          <div class="cursor-pointer text-900 underline" @click="resetPassword">
            {{ t('modules.auth.reset.passwordReset') }}
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onBeforeMount } from 'vue';
import { useUserStore, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { handleError } from '@/utils/errorUtils';
import router from '@/router';
import apiService from '@/services/ApiService';

const { t } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const schema = toTypedSchema(
  yup.object({
    username: yup.string().required(),
    password: yup.string().required(),
  }),
);
const loginForm = useForm({
  validationSchema: schema,
});

const username = loginForm.defineComponentBinds('username');
const password = loginForm.defineComponentBinds('password');

const route = useRoute();

onBeforeMount(() => {
  if (route.query.token !== undefined) {
    const token = route.query.token as string;
    authStore.gewisWebLogin(crypto.randomUUID(), token, apiService).catch(() => {
      void router.replace({ path: '/error' });
    });
  }
});

const loginHandler = loginForm.handleSubmit(async (values) => {
  // Send toHomeView either with or without ToS,
  // router will handle correct routing based on that,
  // but fetching user will result in error.
  try {
    if (values.username.includes('@')) {
      await apiService.authenticate
        .localAuthentication({
          accountMail: values.username,
          password: values.password,
        })
        .then((res) => authStore.handleResponse(res.data));
      if (authStore.getToS == 'ACCEPTED' && authStore.getUser) {
        await userStore.fetchCurrentUserBalance(authStore.getUser.id, apiService);
      } else {
        await router.replace({ path: '/error' });
      }
      toHomeView();
    } else {
      await authStore.gewisLdapLogin(values.username, values.password, apiService);
      if (authStore.getToS == 'ACCEPTED' && authStore.getUser) {
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

const resetPassword = () => {
  void router.push({ name: 'passwordreset' });
};

const toHomeView = () => {
  void router.push(sessionStorage.getItem('fromPath') || { name: 'home' });
  sessionStorage.removeItem('fromPath');
};
</script>

<style scoped lang="scss">
//TODO Fix the amount of css used related to #14 and #29

.cinput {
  padding-left: 10px;
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

.p-inputtext {
  margin-bottom: 0.5rem;
}
</style>
