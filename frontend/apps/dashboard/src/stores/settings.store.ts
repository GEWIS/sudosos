import { defineStore } from 'pinia';
import apiService from '@/services/ApiService';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    token: '',
    stripe: '',
  }),
  actions: {
    async fetchToken() {
      await apiService.authenticate.getGEWISWebPublic().then((res) => {
        this.token = res.data;
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
    getToken(): string {
      return this.token;
    },
    getStripe(): string {
      return this.stripe;
    },
  },
});
