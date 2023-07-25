import {defineStore} from 'pinia';
import {PointOfSaleWithContainersResponse, ProductResponse} from "@sudosos/sudosos-client";
import ApiService from "@/services/ApiService.ts";

export const usePointOfSaleStore = defineStore('pointOfSale', {
    state: () => ({
        pointOfSale: null as PointOfSaleWithContainersResponse | null,
    }),
    getters: {
        allProductCategories() {
            const categories = {};

            if (this.pointOfSale) {
                this.pointOfSale.containers.forEach((container) => {
                    container.products.forEach((product) => {
                        categories[product.category.id] = product.category.name;
                    });
                });
            }
            const res = Object.entries(categories).map(([key, value]) => ({'id': String(key), 'name': value}))
            return res
        },
        getPos(): PointOfSaleWithContainersResponse | null {
            return this.pointOfSale;
        },
    },
    actions: {
        async fetchPointOfSale(id: number): Promise<void> {
            const response = await ApiService.pos.getSinglePointOfSale(id);
            this.pointOfSale = response.data;
        },
        getProduct(productId: number, revision: number, containerId: number): ProductResponse | undefined {
            if (this.pointOfSale) {
                const container = this.pointOfSale.containers.find(c => c.id === containerId);
                if (container) {
                    return container.products.find(p => p.id === productId && p.revision === revision);
                }
            }
            return undefined;
        },
        async getUserPointsOfSale(userId: number) {
            return await ApiService.user.getUsersPointsOfSale(userId);
        },
        async createPointOfSale(name: string, useAuthentication: boolean, containers: Array<number>, ownerId: number){
            return await ApiService.pos.createPointOfSale({name, useAuthentication, containers, ownerId});
        }
    },
});
