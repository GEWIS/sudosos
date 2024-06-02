<template>
  <div class="page-container">
    <h1 class="page-title">{{ $t('termsOfService.acceptFirst') }}</h1>
    <p>{{ $t('termsOfService.description') }}</p>
    <hr />
    <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
    <p>SudoSOS Terms of Service - version 1.0 (14/08/2022)</p>

    <div v-html="tos"/>


    <Checkbox v-model="acceptsExtensiveDataProcessing" :binary="true" class="checkbox"/>
    <label for="accept">{{ $t('termsOfService.agreeData') }}</label>

    <div class="tos-button-box">
      <Button
          type="button"
          @click="handleLogout"
          severity="secondary"
      >
        {{ $t('app.Sign out') }}
      </Button>
      <Button
          type="button"
          @click="acceptTermsOfService"
      >
        {{ $t('termsOfService.agreeToS') }}
      </Button>

    </div>
  </div>
</template>

<script setup lang="ts">
import apiService from '@/services/ApiService';
import router from '@/router';
import { marked } from 'marked';
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import termsOfService from '@/locales/termsOfService.md?raw';
import { ref } from 'vue';

const authStore = useAuthStore();
const userStore = useUserStore();

const tos = marked(termsOfService);

const acceptsExtensiveDataProcessing = ref(false);

const acceptTermsOfService = (async () => {
  await authStore.updateUserToSAccepted(acceptsExtensiveDataProcessing.value, apiService);

  if (authStore.getUser) {
    apiService.user.getIndividualUser(authStore.getUser.id).then((res) => {
      const userStore = useUserStore();
      userStore.setCurrentUser(res.data);
    });
    await userStore.fetchCurrentUserBalance(authStore.getUser.id, apiService);
  }
  router.push({ name: 'home' });


});

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>

<style scoped lang="scss">

.checkbox {
  margin-right: 1rem;
}

p {
  color: black;
}

.page-container {
  margin: 1.5rem!important;
}

.tos-button-box {
  margin-top: 1rem;
}

.tos-button-box > * {
  margin-right: 1rem;
}
</style>
