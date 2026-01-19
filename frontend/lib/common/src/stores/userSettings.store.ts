import { defineStore } from 'pinia';
import type { UserSettingsResponse, PatchUserSettingsRequest } from '@sudosos/sudosos-client';
import { ApiService } from '../services/ApiService';

interface UserSettingsStoreState {
  settings: UserSettingsResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
}

export const useUserSettingsStore = defineStore('userSettings', {
  state: (): UserSettingsStoreState => ({
    settings: null,
    isLoading: false,
    isUpdating: false,
  }),

  getters: {
    /**
     * Get all settings.
     */
    getSettings(state): UserSettingsResponse | null {
      return state.settings;
    },

    /**
     * Get beta enabled setting.
     */
    getBetaEnabled(state): boolean {
      return state.settings?.betaEnabled ?? false;
    },

    /**
     * Get dashboard theme setting.
     */
    getDashboardTheme(state): object | null {
      return state.settings?.dashboardTheme ?? null;
    },

    /**
     * Get language setting.
     */
    getLanguage(state): string | undefined {
      return state.settings?.language;
    },

    /**
     * Check if settings have been loaded.
     */
    isLoaded(): boolean {
      return this.settings !== null;
    },
  },

  actions: {
    /**
     * Fetches user settings from the API.
     * Only fetches if settings haven't been loaded yet.
     */
    async fetchSettings(service: ApiService, userId: number): Promise<UserSettingsResponse> {
      if (this.settings !== null) {
        return this.settings;
      }

      this.isLoading = true;
      try {
        const response = await service.user.getUserSettings(userId);
        this.settings = response.data;
        return response.data;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Updates a specific setting by patching the backend and updating local state.
     */
    async updateSetting<K extends keyof PatchUserSettingsRequest>(
      service: ApiService,
      userId: number,
      key: K,
      value: PatchUserSettingsRequest[K],
    ): Promise<UserSettingsResponse> {
      this.isUpdating = true;
      try {
        const patchRequest: PatchUserSettingsRequest = {
          [key]: value,
        } as PatchUserSettingsRequest;

        const response = await service.user.patchUserSettings(userId, patchRequest);
        this.settings = response.data;
        return response.data;
      } finally {
        this.isUpdating = false;
      }
    },

    /**
     * Updates multiple settings at once.
     */
    async updateSettings(
      service: ApiService,
      userId: number,
      updates: PatchUserSettingsRequest,
    ): Promise<UserSettingsResponse> {
      this.isUpdating = true;
      try {
        const response = await service.user.patchUserSettings(userId, updates);
        this.settings = response.data;
        return response.data;
      } finally {
        this.isUpdating = false;
      }
    },

    /**
     * Convenience method to update beta enabled setting.
     */
    async setBetaEnabled(service: ApiService, userId: number, enabled: boolean): Promise<UserSettingsResponse> {
      return this.updateSetting(service, userId, 'betaEnabled', enabled);
    },

    /**
     * Convenience method to update dashboard theme setting.
     */
    async setDashboardTheme(service: ApiService, userId: number, theme: object | null): Promise<UserSettingsResponse> {
      return this.updateSetting(service, userId, 'dashboardTheme', theme ?? undefined);
    },

    /**
     * Convenience method to update language setting.
     */
    async setLanguage(
      service: ApiService,
      userId: number,
      language: PatchUserSettingsRequest['language'],
    ): Promise<UserSettingsResponse> {
      return this.updateSetting(service, userId, 'language', language);
    },

    /**
     * Clears the settings from the store (useful for logout).
     */
    clearSettings() {
      this.settings = null;
    },
  },
});
