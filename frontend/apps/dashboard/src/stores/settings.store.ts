import { defineStore } from 'pinia';
import apiService from '@/services/ApiService';
import type { ServerStatusResponse } from '@sudosos/sudosos-client';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    status: {} as ServerStatusResponse,
    token: "",
    stripe: ""
  }),
  actions: {
    async fetchMaintenanceMode() {
      this.status.maintenanceMode = (await apiService.rootApi.ping()).data.maintenanceMode;
    },
    async fetchToken(){
      await apiService.authenticate.getGEWISWebPublic().then((res) => {
        this.token = res.data;
        },
      ).catch(() => {
        this.status.maintenanceMode = true;
      });
    },
    async fetchStripe(){
      await apiService.stripe.getStripePublicKey().then((res) =>{
        this.stripe = (res.data as any).publicKey as string;
      });
    },
    async fetchKeys(){
      await this.fetchToken();
      await this.fetchStripe();
    }
  },
  getters: {
    activeSettings(): ServerStatusResponse {
      return this.status;
    },
    getToken(): String {
      return this.token;
    },
    getStripe(): String {
      return this.stripe;
    }
  }
});