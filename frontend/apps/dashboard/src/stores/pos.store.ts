import { defineStore } from 'pinia';
import type {
    CreatePointOfSaleRequest,
    PointOfSaleResponse,
    PointOfSaleWithContainersResponse,
    UpdatePointOfSaleRequest
} from "@sudosos/sudosos-client";
import ApiService from "@/services/ApiService";

export const usePointOfSaleStore = defineStore('pointOfSale', {
    state: () => ({
        pointsOfSale: {} as Record<number, PointOfSaleResponse>,
        pointsOfSaleWithContainers: {} as Record<number, PointOfSaleWithContainersResponse>
    }),
    getters: {

    },
    actions: {
        async fetchPointOfSale(id: number): Promise<PointOfSaleResponse> {
            const response = await ApiService.pos.getSinglePointOfSale(id);
            this.pointsOfSale[id] = response.data;
            return response.data;
        },
        async fetchPointOfSaleWithContainers(id: number): Promise<PointOfSaleWithContainersResponse> {
            const response = await ApiService.pos.getSinglePointOfSale(id);
            this.pointsOfSaleWithContainers[id] = response.data;
            return response.data;
        },
        async getPointsOfSale(take: number, skip: number) {
            const pointsOfSale = (await ApiService.pos.getAllPointsOfSale(take, skip)).data;
            pointsOfSale.records.forEach((pointOfSale) => {
                this.pointsOfSale[pointOfSale.id] = pointOfSale;
            });
            return pointsOfSale;
        },
        async getPointOfSale(id: number) {
            const pointOfSale = this.pointsOfSaleWithContainers[id];
            if(!pointOfSale) {
                await this.fetchPointOfSaleWithContainers(id);
            }
            return this.pointsOfSaleWithContainers[id];
        },
        async getUserPointsOfSale(userId: number, take: number, skip: number) {
            return (await ApiService.user.getUsersPointsOfSale(userId, take, skip)).data;
        },
        async createPointOfSale(createPointOfSaleRequest: CreatePointOfSaleRequest) {
            return await ApiService.pos.createPointOfSale(createPointOfSaleRequest);
        },
        async updatePointOfSale(id: number, updatePointOfSale: UpdatePointOfSaleRequest):
            Promise<PointOfSaleWithContainersResponse> {

            return await ApiService.pos.updatePointOfSale(id, updatePointOfSale)
                .then((res) => {
                    const pointOfSale: PointOfSaleResponse = res.data;
                    const pointOfSaleWithContainers: PointOfSaleWithContainersResponse = res.data;
                    this.pointsOfSale[pointOfSale.id] = pointOfSale;
                    this.pointsOfSaleWithContainers[pointOfSaleWithContainers.id] = pointOfSaleWithContainers;
                    return this.pointsOfSaleWithContainers[pointOfSaleWithContainers.id];
                });
        },
        async deletePointOfSale(id: number) {
            delete this.pointsOfSale[id];
            delete this.pointsOfSaleWithContainers[id];
            return await ApiService.pos.deletePointOfSale(id);
        }
    },
});
