// bannerStore.ts

import { defineStore } from 'pinia';
import { BannerResponse } from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';

export const useBannerStore = defineStore('banner', {
  state: () => ({
    banners: [] as BannerResponse[],
  }),
  actions: {
    async fetchBanners() {
      this.banners = await fetchAllPages<BannerResponse>((take, skip) =>
        // @ts-expect-error PaginatedBannerResponse is the same as PaginatedResult<BannerResponse>
        apiService.openBanner.getAllOpenBanners(take, skip),
      );
    },
  },
  getters: {
    activeBanners(): BannerResponse[] {
      // Filter banners that are currently active based on their start and end dates and have an image attached.
      const now = new Date().toISOString();
      return this.banners.filter(
        (banner) => banner.image && banner.active && banner.startDate <= now && banner.endDate >= now,
      );
    },
  },
});
