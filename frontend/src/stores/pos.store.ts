import { defineStore } from 'pinia';
import {
  PointOfSaleResponse,
  PointOfSaleWithContainersResponse,
  ProductResponse
} from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";

export const usePointOfSaleStore = defineStore('pointOfSale', {
  state: () => ({
    pointOfSale: null as PointOfSaleWithContainersResponse | null,
    usersPointOfSales: null as PointOfSaleResponse[] | null,
  }),
  getters: {
    allProductCategories() {
      const categories: { [key: number]: string } = {};

      if (this.pointOfSale) {
        this.pointOfSale.containers.forEach((container) => {
          container.products.forEach((product) => {
            categories[product.category.id] = product.category.name;
          });
        });
      }
      return Object.entries(categories).map(([key, value]) => ({ id: String(key), name: value }));
    },
    getPos(): PointOfSaleWithContainersResponse | null {
      return this.pointOfSale;
    }
  },
  actions: {
    async fetchPointOfSale(id: number): Promise<void> {
      const response = await apiService.pos.getSinglePointOfSale(id);
      this.pointOfSale = response.data;
    },
    async fetchUserPointOfSale(id: number): Promise<void> {
      this.usersPointOfSales = await fetchAllPages<PointOfSaleResponse>(0, 100,  (take, skip) =>
          // @ts-ignore
          apiService.user.getUsersPointsOfSale(id, take, skip)
      );
    },
    getProduct(
      productId: number,
      revision: number,
      containerId: number
    ): ProductResponse | undefined {
      if (this.pointOfSale) {
        const container = this.pointOfSale.containers.find((c) => c.id === containerId);
        if (container) {
          return container.products.find((p) => p.id === productId && p.revision === revision);
        }
      }
      return undefined;
    }
  }
});
