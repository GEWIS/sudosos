<template>
  <PageContainer class="m-6 w-full mx-auto">
    <article class="prose prose-inherit mx-auto max-w-4xl">
      <h1 class="text-4xl mb-4">{{ t('modules.auth.tos.acceptFirst') }}</h1>
      <p>{{ t('modules.auth.tos.description') }}</p>
      <Divider />
      <div v-if="tosStore.fetchFailed" class="flex flex-column items-start gap-4 my-4">
        <Message severity="error">{{ t('modules.auth.tos.fetchFailed') }}</Message>
        <Button severity="secondary" type="button" @click="retryFetchTermsOfService">
          {{ t('modules.auth.tos.retry') }}
        </Button>
      </div>
      <template v-else>
        <p>{{ t('components.general.termsOfService.header', { version: tosStore.version, date: tosStore.date }) }}</p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="tos" />
      </template>

      <div class="flex items-center my-4 gap-2">
        <Checkbox
          v-model="acceptsExtensiveDataProcessing"
          :binary="true"
          class="checkbox"
          :disabled="tosStore.fetchFailed"
        />
        <label for="accept">{{ t('modules.auth.tos.agreeData') }}</label>
      </div>

      <div class="flex justify-end gap-4 mt-4">
        <Button severity="secondary" type="button" @click="handleLogout">
          {{ t('common.signOut') }}
        </Button>
        <Button :disabled="tosStore.fetchFailed" type="button" @click="acceptTermsOfService">
          {{ t('modules.auth.tos.agreeToS') }}
        </Button>
      </div>
    </article>
  </PageContainer>
</template>
<script setup lang="ts">
import { marked } from 'marked';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import router from '@/router';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import PageContainer from '@/layout/PageContainer.vue';
import { useTermsOfServiceStore } from '@/stores/termsOfService.store';

const { t } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const tosStore = useTermsOfServiceStore();

const tos = computed(() => marked(tosStore.getTermsOfService));

const acceptsExtensiveDataProcessing = ref(false);

const acceptTermsOfService = async () => {
  await authStore.updateUserToSAccepted(acceptsExtensiveDataProcessing.value, tosStore.version, apiService);

  if (authStore.getUser) {
    apiService.user
      .getIndividualUser({ id: authStore.getUser.id })
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

const retryFetchTermsOfService = async () => {
  await tosStore.fetchTermsOfService().catch((err) => {
    handleError(err, useToast());
  });
};

const handleLogout = () => {
  authStore.logout();
  void router.push({ name: 'login' });
};
</script>

<style scoped lang="scss">
.prose {
  color: var(--text-color-contrast) !important;
}

.prose :is(h1, h2, h3, h4, h5, h6) {
  color: var(--text-color-contrast) !important;
}

.prose :is(b, strong) {
  color: var(--text-color-contrast) !important;
}
</style>
