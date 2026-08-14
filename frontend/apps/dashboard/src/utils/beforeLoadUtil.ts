import {
  clearTokenInStorage,
  getTokenFromStorage,
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
    // Send the latest JWT on every socket (re)connect so the server can
    // attach the user and authorise room subscriptions (e.g. `tasks:all`).
    // The getter is invoked per connect attempt, so token refreshes are
    // picked up automatically.
    setupWebSocket({ getToken: () => getTokenFromStorage(apiService.tokenKey).token ?? null });
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
