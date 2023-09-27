<template>
  <div>
    <main>
      <img id="login-image" src="../assets/img/bier.png" alt="logo" />
      <h1>{{ $t('login.SudoSOS Login') }}</h1>
      <Button id="login-gewis-button" @click="loginViaGEWIS" severity="success"
        ><img id="gewis-branding" src="../assets/img/gewis-branding.svg" alt="GEWIS" />{{
          $t('login.Login via GEWIS')
        }}</Button
      >
      <hr />
      <form id="login-form" @submit.prevent="ldapLogin">
        <!--      TODO: Form validation with vee-validate -->
        <label for="username">{{ $t('login.Username') }}</label>
        <InputText
          id="username"
          type="text"
          v-bind="username"
          :placeholder="$t('login.Enter username')"
        />
        <label for="password">{{ $t('login.Password') }}</label>
        <InputText
          id="password"
          type="password"
          v-bind="password"
          :placeholder="$t('login.Enter password')"
        />
        <Button type="submit" id="login-button" severity="danger">{{ $t('login.Login') }}</Button>
        <a href="https://wieditleesttrekteenbak.nl/">{{ $t('login.Password reset') }}</a>
      </form>
    </main>
    <CopyrightBanner />
  </div>
</template>

<script setup lang="ts">
import CopyrightBanner from "@/components/CopyrightBanner.vue";
import { onBeforeMount } from "vue";
import { useUserStore, useAuthStore } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import { useRoute } from "vue-router";
import { v4 as uuid } from 'uuid';
import router from "@/router";
import { useForm } from "vee-validate";
import * as yup from 'yup';
import { toTypedSchema } from '@vee-validate/yup';

const authStore = useAuthStore();
const userStore = useUserStore();
const schema = toTypedSchema(
  yup.object({
    username: yup.string().required(),
    password: yup.string().required()
  })
);
const { values, defineComponentBinds } = useForm({
  validationSchema: schema
});
const username = defineComponentBinds('username');
const password = defineComponentBinds('password');

const route = useRoute();

onBeforeMount(() => {
  if (route.query.token !== undefined) {
    const token = route.query.token as string;
    authStore.gewisWebLogin(uuid(), token, apiService).catch((error) => {
      console.error(error);
    });
  }
});

const ldapLogin = async (event: Event) => {
  event.preventDefault();
  if (!values.username || !values.password) return;
  await authStore.gewisLdapLogin(values.username, values.password, apiService).then(() => {
    console.error("loggedin");
    if (authStore.getUser) userStore.fetchCurrentUserBalance(authStore.getUser.id, apiService);
    router.push({ name: 'home' });
  }).catch((error) => {
    console.error(error);
  });
};
const loginViaGEWIS = () => {
  window.location.href = `https://gewis.nl/token/${import.meta.env.VITE_APP_GEWIS_TOKEN}`;
};
</script>

<style scoped lang="scss">
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

label {
  color: black;
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
</style>
