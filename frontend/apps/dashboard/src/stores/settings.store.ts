import { defineStore } from 'pinia';
import type { ServerStatusResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    status: {} as Partial<ServerStatusResponse>,
    token: '',
    stripe: '',
  }),
  actions: {
    async fetchMaintenanceMode() {
      this.status.maintenanceMode = (await apiService.rootApi.ping()).data.maintenanceMode;
    },
    async fetchToken() {
      await apiService.authenticate
        .getGEWISWebPublic()
        .then((res) => {
          this.token = res.data;
        })
        .catch(() => {
          this.status.maintenanceMode = true;
        });
    },
    async fetchStripe() {
      await apiService.stripe.getStripePublicKey().then((res) => {
        // The spec is wrong, that is why the type cast is there
        this.stripe = (res.data as unknown as { publicKey: string }).publicKey;
      });
    },
    async fetchKeys() {
      await this.fetchToken();
      await this.fetchStripe();
    },
  },
  getters: {
    activeSettings(): Partial<ServerStatusResponse> {
      return this.status;
    },
    getToken(): string {
      return this.token;
    },
    getStripe(): string {
      return this.stripe;
    },
  },
});
