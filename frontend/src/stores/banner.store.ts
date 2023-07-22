// bannerStore.ts

import { defineStore } from 'pinia';
import {BannerResponse} from "@sudosos/sudosos-client";
import {fetchAllPages} from "@sudosos/sudosos-frontend-common";

import {ApiService, useAuthStore} from "@sudosos/sudosos-frontend-common";
const apiService = new ApiService(import.meta.env.VITE_LIVE_APP_API_BASE,() => '');

export const useBannerStore = defineStore('banner', {
  state: () => ({
    banners: [] as BannerResponse[],
  }),
  actions: {
    async fetchBanners() {
      this.banners = await fetchAllPages<BannerResponse[]>(0, 100, (take, skip) => apiService.openBanner.openBannersGet(take, skip));
    },
  },
  getters: {
    activeBanners(): BannerResponse[] {
      // Filter banners that are currently active based on their start and end dates
      const now = new Date().toISOString();
      return this.banners.filter(
        (banner) => banner.active || ( banner.startDate <= now && banner.endDate >= now )
      );
    },
  },
});
