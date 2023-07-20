<template>
<div>
  <main>
    <img id="login-image" src="../assets/img/bier.png" alt="logo">
    <h1>SudoSOS Login</h1>
    <Button id="login-gewis-button" @click="loginViaGEWIS" severity="success"><img id="gewis-branding" src="../assets/img/gewis-branding.svg" alt="GEWIS">Login via GEWIS</Button>
    <hr>
    <label for="username">Username</label>
    <InputText id="username" type="text" v-model="username" placeholder="Enter username"/>
    <label for="password">Password</label>
    <InputText id="password" type="password" v-model="password" placeholder="Enter password" />
    <Button @click="ldapLogin" id="login-button" severity="danger">Login</Button>
    <a href="https://wieditleesttrekteenbak.nl/">Reset password (External accounts only)</a>
  </main>
  <CopyrightBanner />
</div>
</template>

<script setup lang="ts">
import CopyrightBanner from "@/components/CopyrightBanner.vue";
import {onBeforeMount, ref} from "vue";
import {useUserStore, useAuthStore} from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService"
import {useRoute} from "vue-router";
import { v4 as uuid } from 'uuid'
import router from "@/router";

const authStore = useAuthStore();


const username = ref('');
const password = ref('');
const route = useRoute();

onBeforeMount(() => {
  if (route.query.token !== undefined) {
    const token  = route.query.token as string;
    authStore.gewisWebLogin(
      uuid(), token, apiService,
    ).catch((error) => {
      console.error(error)
    })
  }
})

const ldapLogin = async () => {
  await authStore.gewisLdapLogin(username.value, password.value, apiService).then(() => {
    router.push('/balance')
  }).catch((error) => {
    console.error(error);
  })
}

const loginViaGEWIS = () => {
  window.location.href = `https://gewis.nl/token/${import.meta.env.VITE_APP_GEWIS_TOKEN}`;
}

</script>

<style scoped lang="scss">
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
  margin: 0 auto;

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
