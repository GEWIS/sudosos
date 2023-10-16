<template>
  <div class="page-container">
    <h1 class="page-title">{{ $t('termsOfService.acceptFirst') }}</h1>
    <p>{{ $t('termsOfService.description') }}</p>
    <hr />
    <p>SudoSOS Terms of Service - version 1.0 (14/08/2022)</p>

    <div v-html="tos" class="geef-zwarte-text"/>

    <p class="geef-zwarte-text">{{ $t('termsOfService.extensiveDataProcessing') }}</p>

    <div class="checkbox-data">
      <input
          class="checkbox-check-input"
          type="checkbox"
          value=""
          id="flexCheckDefault"
      >

      <label class="form-check-label geef-zwarte-text" for="flexCheckDefault">
        {{ $t('termsOfService.agreeData') }}
      </label>

    </div>
    <div class="tos-button-box">
      <button
          type="button"
          class="btn btn-secondary btn-lg"
          @click="handleLogout"
      >
        {{ $t('app.Sign out') }}
      </button>
      <button
          type="button"
          class="btn btn-danger btn-lg"
          @click="acceptTermsOfService"
      >
        {{ $t('termsOfService.agreeToS') }}
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import apiService from '@/services/ApiService';
import router from '@/router';
import { marked } from 'marked';
import { isAuthenticated, useAuthStore } from "@sudosos/sudosos-frontend-common";
import termsOfService from '@/locales/TermsOfService.md?raw';
import { onMounted } from "vue";

const authStore = useAuthStore();

const tos = marked(termsOfService);

onMounted(async () => {
  if(isAuthenticated && authStore.getUser.acceptedToS == 'ACCEPTED') {
    toHomeView();
  }
});

const acceptTermsOfService = (async () => {
  await apiService.user.acceptTos({
    extensiveDataProcessing: true
  }).then(() => {
    toHomeView();
  });
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

const toHomeView = () => {
  router.push({ name: 'home' });
};
</script>

<style scoped lang="scss">
@import '../styles/BasePage.css';

.checkbox-data {
  font-weight: 600;
}

p {
  color: black;
}
.page-container {
  margin: 1.5rem!important;
}
.geef-zwarte-text {
  color: black;
}
</style>