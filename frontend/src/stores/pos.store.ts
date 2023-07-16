import { defineStore } from 'pinia';
import ApiService from "@/services/ApiService";
import {PointOfSaleWithContainersResponse} from "@sudosos/sudosos-client";

export const usePointOfSaleStore = defineStore('pointOfSale', {
  state: () => ({
    pointOfSale: null as PointOfSaleWithContainersResponse | null,
  }),
  getters: {
    allProductCategories() {
      const categories = new Set<{ id: number; name: string }>();

      if (this.pointOfSale) {
        this.pointOfSale.containers.forEach((container) => {
          container.products.forEach((product) => {
            categories.add({ id: product.category.id, name: product.category.name });
          });
        });
      }

      return Array.from(categories);
    },
  },
  actions: {
    async fetchPointOfSale(id: number): Promise<void> {
      const response = await ApiService.pos.getSinglePointOfSale(id);
      this.pointOfSale = response.data;
    },
  },
});
