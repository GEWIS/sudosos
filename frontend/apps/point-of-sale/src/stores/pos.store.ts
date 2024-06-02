import { defineStore } from 'pinia';
import {
  PaginatedBaseTransactionResponse,
  PointOfSaleResponse,
  PointOfSaleWithContainersResponse,
  ProductResponse, UserResponse
} from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";

export const usePointOfSaleStore = defineStore('pointOfSale', {
  state: () => ({
    pointOfSale: null as PointOfSaleWithContainersResponse | null,
    pointOfSaleMembers: null as UserResponse[] | null,
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
    },
    getPointOfSaleMembers(): UserResponse[] | null {
      return this.pointOfSaleMembers;
    }
  },
  actions: {
    async fetchRecentPosTransactions(): Promise<PaginatedBaseTransactionResponse | null> {
      if (!this.pointOfSale) return null;
      const response = await apiService.pos.getTransactions(this.pointOfSale.id);
      return response.data;
    },
    async fetchPointOfSale(id: number): Promise<void> {
      const response = await apiService.pos.getSinglePointOfSale(id);
      this.pointOfSaleMembers = null;
      this.pointOfSale = response.data;
    },
    async fetchPointOfSaleMembers(organId: number): Promise<void> {
      const response = await apiService.user.getOrganMembers(organId);
      this.pointOfSaleMembers = response.data.records;
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
