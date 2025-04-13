<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('modules.auth.tos.acceptFirst') }}</h1>
    <p>{{ t('modules.auth.tos.description') }}</p>
    <hr />
    <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
    <p>SudoSOS Terms of Service - version 1.0 (14/08/2022)</p>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="tos" />

    <Checkbox v-model="acceptsExtensiveDataProcessing" :binary="true" class="checkbox" />
    <label for="accept">{{ t('modules.auth.tos.agreeData') }}</label>

    <div class="tos-button-box">
      <Button severity="secondary" type="button" @click="handleLogout">
        {{ t('common.signOut') }}
      </Button>
      <Button type="button" @click="acceptTermsOfService">
        {{ t('modules.auth.tos.agreeToS') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import termsOfService from '@/locales/termsOfService.md?raw';
import router from '@/router';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();

const tos = marked(termsOfService);

const acceptsExtensiveDataProcessing = ref(false);

const acceptTermsOfService = async () => {
  await authStore.updateUserToSAccepted(acceptsExtensiveDataProcessing.value, apiService);

  if (authStore.getUser) {
    apiService.user
      .getIndividualUser(authStore.getUser.id)
      .then((res) => {
        const userStore = useUserStore();
        userStore.setCurrentUser(res.data);
      })
      .catch((err) => {
        handleError(err, useToast());
      });
    await userStore.fetchCurrentUserBalance(authStore.getUser.id, apiService);
  }
  void router.push({ name: 'home' });
};

const handleLogout = () => {
  authStore.logout();
  void router.push({ name: 'login' });
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
  margin: 1.5rem !important;
}

.tos-button-box {
  margin-top: 1rem;
}

.tos-button-box > * {
  margin-right: 1rem;
}
</style>
