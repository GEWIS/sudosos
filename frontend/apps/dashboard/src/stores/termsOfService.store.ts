import { defineStore } from 'pinia';
import apiService from '@/services/ApiService';

export const useTermsOfServiceStore = defineStore('termsOfService', {
  state: () => ({
    tos: '',
    version: '',
    date: '',
    fetchFailed: true,
  }),
  actions: {
    async fetchTermsOfService() {
      try {
        const res = await apiService.termsOfService.getLatestTermsOfService();
        this.tos = res.data.content;
        this.version = String(res.data.versionNumber);
        this.date = new Date(res.data.date).toLocaleString('nl-NL', {
          dateStyle: 'short',
        });
        this.fetchFailed = false;
      } catch (e) {
        this.fetchFailed = true;
        throw e;
      }
    },
  },
  getters: {
    getTermsOfService(): string {
      return this.tos;
    },
  },
});
