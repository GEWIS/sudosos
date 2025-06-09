<template>
  <div class="max-w-[24rem] mx-auto">
    <img alt="logo" class="block max-h-[9rem] mx-auto my-0" src="../../../assets/img/bier.png" />
    <div class="text-900 text-5xl mt-2 mx-auto mb-2 w-full">{{ t('modules.auth.login.sudosos') }}</div>
    <Button id="login-gewis-button" class="items-center flex justify-center mx-auto my-3 w-64" @click="loginViaGEWIS">
      <img alt="GEWIS" class="h-18 mr-3" src="../../../assets/img/gewis-branding.svg" />
      {{ t('modules.auth.login.gewis') }}
    </Button>
    <Button id="login-gewis-button" class="items-center flex justify-center mx-auto my-3 w-64" @click="navigateToLocal">
      {{ t('modules.auth.login.localAccount') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import apiService from '@/services/ApiService';
import router from '@/router';
import { useSettingsStore } from '@/stores/settings.store';

const { t } = useI18n();

const settingStore = useSettingsStore();
const authStore = useAuthStore();
const route = useRoute();
const returning = ref();

const navigateToLocal = () => {
  void router.push('/local');
};

const hasToken = () => {
  const rawToken = localStorage.getItem('jwt_token') as string;
  return rawToken !== null;
};

onBeforeMount(() => {
  if (route.query.token !== undefined) {
    const token = route.query.token as string;
    authStore
      .gewisWebLogin(crypto.randomUUID(), token, apiService)
      .then(() => {
        void router.push(sessionStorage.getItem('fromPath') || '/');
        sessionStorage.removeItem('fromPath');
      })
      .catch(() => {
        void router.replace({ path: '/error' });
      });
  }
  returning.value = hasToken();
});
const loginViaGEWIS = () => {
  window.location.href = `https://gewis.nl/token/${settingStore.getToken}`;
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
