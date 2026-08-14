import {
  clearTokenInStorage,
  populateStoresFromToken,
  setupWebSocket,
  useAuthStore,
} from '@sudosos/sudosos-frontend-common';

import { useSettingsStore } from '@/stores/settings.store';
import apiService from '@/services/ApiService';
import { initializeAuthHook } from '@/composables/useAuthHook';
import { useTermsOfServiceStore } from '@/stores/termsOfService.store';

export default async function beforeLoad() {
  const settingsStore = useSettingsStore();
  const termsOfServiceStore = useTermsOfServiceStore();
  initializeAuthHook();

  try {
    setupWebSocket();
    await settingsStore.fetchKeys();
  } catch (e) {
    console.error(e);
    return;
  }

  await populateStoresFromToken(apiService).catch(() => {
    clearTokenInStorage();
    const authStore = useAuthStore();
    authStore.logout();
  });

  await termsOfServiceStore.fetchTermsOfService().catch((e) => {
    console.error(e);
  });
}
