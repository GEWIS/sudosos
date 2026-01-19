import { ref } from 'vue';
import { authEventEmitter, useUserSettingsStore, useAuthStore } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';
import { isBetaEnabled } from '@/utils/betaUtil';

const showRedirectOverlay = ref(false);
let isInitialized = false;

export function useBetaSync() {
  const settingsStore = useUserSettingsStore();
  const authStore = useAuthStore();

  async function syncBetaSettings() {
    const user = authStore.getUser;
    if (!user) return;

    try {
      // Fetch user settings
      await settingsStore.fetchSettings(apiService, user.id);

      const betaEnabledInSettings = settingsStore.getBetaEnabled;
      const betaEnabledInCookie = isBetaEnabled();

      // Sync cookie to match API settings
      if (betaEnabledInSettings && !betaEnabledInCookie) {
        // API says enabled but cookie says disabled → set cookie and reload
        showRedirectOverlay.value = true;

        setTimeout(() => {
          document.cookie = 'X-Beta-Enabled=true; path=/';
          location.reload();
        }, 1000);
      } else if (!betaEnabledInSettings && betaEnabledInCookie) {
        // API says disabled but cookie says enabled → remove cookie and reload
        showRedirectOverlay.value = true;

        setTimeout(() => {
          // Remove cookie by setting it with an expiration date in the past
          document.cookie = 'X-Beta-Enabled=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to sync beta settings:', error);
    }
  }

  function initializeBetaSync() {
    if (isInitialized) return;
    isInitialized = true;

    authEventEmitter.onAuthenticated(() => {
      void syncBetaSettings();
    });
  }

  return {
    showRedirectOverlay,
    initializeBetaSync,
    syncBetaSettings,
  };
}
