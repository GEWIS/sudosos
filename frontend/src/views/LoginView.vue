<template>
  <div>
        <img class="max-h-9rem block mx-auto my-0" src="@/assets/img/bier.png" alt="logo"/>
        <div class="text-900 text-5xl mt-0 mx-auto mb-2 w-full">{{ $t('login.SudoSOS Login') }}</div>
        <Button
            id="login-gewis-button"
            @click="loginViaGEWIS"
            class="my-3 mx-auto w-full flex justify-content-center align-items-center"
        >
          <img class="mr-3 h-18" src="@/assets/img/gewis-branding.svg" alt="GEWIS"/>
          {{ $t('login.Login via GEWIS') }}
        </Button>
        <Button
            id="login-gewis-button"
            @click="navigateToLocal"
            class="my-3 mx-auto w-full flex justify-content-center align-items-center"
        >
          {{ $t('login.localAccount') }}
        </Button>
      </div>
</template>


<script setup lang="ts">
import { useRoute } from "vue-router";
import { onBeforeMount, ref } from "vue";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import router from "@/router";
import { v4 as uuid } from 'uuid';

const authStore = useAuthStore();
const route = useRoute();
const returning = ref();

const navigateToLocal = () => {
  router.push('/local');
};

const hasToken = () => {
  const rawToken = localStorage.getItem('jwt_token') as string;
  return (rawToken !== null);
};

onBeforeMount(() => {
  if (route.query.token !== undefined) {
    const token = route.query.token as string;
    authStore.gewisWebLogin(uuid(), token, apiService)
    .then(() => {
      router.push('/')
    })
    .catch(() => {
      router.replace({ path: "/error" });
    });
  }
  returning.value = hasToken();
});
const loginViaGEWIS = () => {
  window.location.href = `https://gewis.nl/token/${import.meta.env.VITE_APP_GEWIS_TOKEN}`;
};
</script>

<style scoped lang="scss">
//TODO Fix the amount of css used related to #14 and #29

.h-18 {
  height: 24px;
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
