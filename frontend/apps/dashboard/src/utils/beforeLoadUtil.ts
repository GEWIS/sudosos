import { clearTokenInStorage, populateStoresFromToken, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { GrolschGreen, BetaBlue } from '@sudosos/themes';
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings.store';
import apiService from '@/services/ApiService';
import { useConditionalPreset } from '@/composables/conditionalPreset';
import { useOrganMember } from '@/composables/organMember';
import { isBetaEnabled } from '@/utils/betaUtil';

export default async function beforeLoad() {
  const settingsStore = useSettingsStore();

  try {
    await settingsStore.fetchMaintenanceMode();
    await settingsStore.fetchKeys();
  } catch (e) {
    // Overload status to indicate that backend is not available
    settingsStore.status.maintenanceMode = undefined;
    console.error(e);
    return;
  }

  await populateStoresFromToken(apiService).catch(() => {
    clearTokenInStorage();
    const authStore = useAuthStore();
    authStore.logout();
  });

  useConditionalPreset([
    { condition: useOrganMember(18214), preset: GrolschGreen },
    { condition: computed(() => isBetaEnabled()), preset: BetaBlue },
  ]);
}
