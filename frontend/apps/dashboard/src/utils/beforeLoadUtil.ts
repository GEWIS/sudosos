import { clearTokenInStorage, populateStoresFromToken, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useSettingsStore } from '@/stores/settings.store';
import apiService from '@/services/ApiService';

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
}
