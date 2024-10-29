import { useSettingsStore } from '@/stores/settings.store';
import { clearTokenInStorage, populateStoresFromToken, useAuthStore } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';

export default async function beforeLoad() {

  const settingsStore = useSettingsStore();
  await settingsStore.fetchMaintenanceMode();

  await populateStoresFromToken(apiService).catch(() => {
    clearTokenInStorage();
    const authStore = useAuthStore();
    authStore.logout();
  });
}