import { defineStore } from 'pinia';
import type {
  CreatePointOfSaleRequest,
  PointOfSaleResponse,
  PointOfSaleWithContainersResponse,
  UpdatePointOfSaleRequest,
} from '@sudosos/sudosos-client';
import ApiService from '@/services/ApiService';

export const usePointOfSaleStore = defineStore('pointOfSale', {
  state: () => ({
    pointsOfSale: {} as Record<number, PointOfSaleResponse>,
    pointsOfSaleWithContainers: {} as Record<number, PointOfSaleWithContainersResponse>,
  }),
  getters: {},
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
      if (!pointOfSale) {
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
    async updatePointOfSale(
      id: number,
      updatePointOfSale: UpdatePointOfSaleRequest,
    ): Promise<PointOfSaleWithContainersResponse> {
      return await ApiService.pos.updatePointOfSale(id, updatePointOfSale).then((res) => {
        const pointOfSale: PointOfSaleResponse = res.data;
        const pointOfSaleWithContainers: PointOfSaleWithContainersResponse = res.data;
        this.pointsOfSale[pointOfSale.id] = pointOfSale;
        this.pointsOfSaleWithContainers[pointOfSaleWithContainers.id] = pointOfSaleWithContainers;
        return this.pointsOfSaleWithContainers[pointOfSaleWithContainers.id]!;
      });
    },
    async removeContainerFromPos(posId: number, containerId: number) {
      const pos = this.pointsOfSaleWithContainers[posId];
      if (!pos) {
        throw new Error(`Point of sale with id ${posId} not found`);
      }

      if (!pos.containers || !pos.containers.length) {
        throw new Error(`Point of sale with id ${posId} does not have containers loaded`);
      }

      if (pos.containers.findIndex((e) => e.id === containerId) === -1) {
        throw new Error(`Container with id ${containerId} not found in point of sale with id ${posId}`);
      }

      const containers = pos.containers.filter((e) => e.id !== containerId).map((e) => e.id);

      const updatePointOfSaleRequest: UpdatePointOfSaleRequest = {
        name: pos.name,
        useAuthentication: pos.useAuthentication,
        containers,
        id: posId,
      };
      return this.updatePointOfSale(posId, updatePointOfSaleRequest);
    },
    async deletePointOfSale(id: number) {
      delete this.pointsOfSale[id];
      delete this.pointsOfSaleWithContainers[id];
      return await ApiService.pos.deletePointOfSale(id);
    },
  },
});
