import { defineStore } from 'pinia';
import { type BannerRequest, type BannerResponse } from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';

export const useBannersStore = defineStore('banners', {
  state: () => ({
    banners: [] as BannerResponse[],
  }),
  actions: {
    async fetchBanners() {
      // TODO: Not fetch all banners (see #51)
      this.banners = await fetchAllPages<BannerResponse>((take, skip) =>
        // @ts-expect-error PaginatedBannerResponse is the same as PaginatedResult<BannerResponse>
        apiService.openBanner.getAllOpenBanners(take, skip),
      );
    },

    /**
     * Updates the banner information, excluding the image
     *
     * @param bannerid Id of the banner
     * @param banner The content of the banner
     */
    async updateBanner(bannerid: number, banner: BannerRequest) {
      return await apiService.banner.update(bannerid, banner);
    },

    /**
     * Updates the image of the banner.
     *
     * @param bannerid The banner id
     * @param image The image file
     */
    async updateBannerImage(bannerid: number, image: File) {
      return await apiService.banner.updateImage(bannerid, image);
    },

    /**
     * Create a new banner.
     *
     * @param banner The banner request.
     */
    async createBanner(bannerRequest: BannerRequest) {
      return await apiService.banner.create(bannerRequest);
    },
  },
  getters: {
    activeBanners(): BannerResponse[] {
      // Filter banners that are currently active based on their start and end dates
      const now = new Date().toISOString();
      return this.banners.filter((banner) => banner.active || (banner.startDate <= now && banner.endDate >= now));
    },
  },
});
