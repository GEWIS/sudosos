import { defineStore } from 'pinia';
import { type BannerRequest, type BannerResponse } from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';

export const useBannersStore = defineStore('banners', {
  state: () => ({
    banners: {} as Record<number, BannerResponse>,
  }),
  getters: {
    /**
     * All banners as a list.
     */
    allBanners(state): BannerResponse[] {
      return Object.values(state.banners);
    },
    /**
     * Only active or currently valid banners.
     */
    activeBanners(state): BannerResponse[] {
      const now = new Date().toISOString();
      return Object.values(state.banners).filter(
        (banner) => banner.active || (banner.startDate <= now && banner.endDate >= now),
      );
    },
    /**
     * Get a banner by ID.
     */
    getBanner:
      (state) =>
      (id: number): BannerResponse | null => {
        return state.banners[id] ?? null;
      },
  },
  actions: {
    /**
     * Fetches all banners and stores them by ID.
     */
    async fetchBanners() {
      const all = await fetchAllPages<BannerResponse>((take, skip) =>
        // @ts-expect-error: PaginatedBannerResponse is the same as PaginatedResult<BannerResponse>
        apiService.openBanner.getAllOpenBanners(take, skip),
      );

      for (const banner of all) {
        this.banners[banner.id] = banner;
      }
    },

    /**
     * Updates a banner by ID (excluding image).
     */
    async updateBanner(bannerId: number, banner: BannerRequest) {
      const updated = await apiService.banner.update(bannerId, banner);
      this.banners[bannerId] = { ...this.banners[bannerId], ...banner };
      return updated;
    },

    /**
     * Updates only the image of a banner.
     */
    async updateBannerImage(bannerId: number, image: File) {
      const banner = this.banners[bannerId];
      if (!banner) return;
      banner.image = URL.createObjectURL(image);
      this.banners[banner.id] = { ...banner };
      await apiService.banner.updateImage(bannerId, image);
    },

    /**
     * Creates a new banner and adds it to the store.
     */
    async createBanner(bannerRequest: BannerRequest) {
      const resp = await apiService.banner.create(bannerRequest);
      this.banners[resp.data.id] = resp.data;
      return resp;
    },
  },
});
