import { defineStore } from 'pinia';
import apiService from '@/services/ApiService';
import type { ServerStatusResponse } from '@sudosos/sudosos-client';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {} as ServerStatusResponse
  }),
  actions: {
    async fetchMaintenanceMode() {
      this.settings.maintenanceMode = (await apiService.rootApi.ping()).data.maintenanceMode;
    }
  },
  getters: {
    activeSettings(): ServerStatusResponse {
      return this.settings;
    }
  }
});