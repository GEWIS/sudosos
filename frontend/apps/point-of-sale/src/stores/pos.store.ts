import { defineStore } from 'pinia';
import {
  BaseUserResponse,
  PaginatedBaseTransactionResponse,
  PointOfSaleAssociateUsersResponse,
  PointOfSaleResponse,
  PointOfSaleWithContainersResponse,
  ProductResponse,
  UserWithIndex,
} from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import { userApiService, posApiService } from '@/services/ApiService';

export type PointOfSaleAssociate = BaseUserResponse & { type: 'owner' | 'cashier'; index?: number };

export const usePointOfSaleStore = defineStore('pointOfSale', {
  state: () => ({
    pointOfSale: null as PointOfSaleWithContainersResponse | null,
    pointOfSaleAssociates: null as PointOfSaleAssociateUsersResponse | null,
    usersPointOfSales: null as PointOfSaleResponse[] | null,
    allPointOfSales: null as PointOfSaleResponse[] | null,
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
    getPointOfSaleAssociates(): PointOfSaleAssociate[] | null {
      if (this.pointOfSaleAssociates == null) return null;

      const owners: PointOfSaleAssociate[] = this.pointOfSaleAssociates.ownerMembers.map(
        (u: UserWithIndex): PointOfSaleAssociate =>
          ({
            ...u,
            type: 'owner',
          }) as PointOfSaleAssociate,
      );
      const cashiers: PointOfSaleAssociate[] = this.pointOfSaleAssociates.cashiers
        // Owner overrides cashier (so we avoid duplicates)
        .filter((u1) => !owners.some((u2) => u1.id === u2.id))
        .map((u: BaseUserResponse): PointOfSaleAssociate => ({ ...u, type: 'cashier' }));

      const associates = owners.concat(cashiers);
      return associates.sort((a, b) => a.id - b.id);
    },
  },
  actions: {
    async fetchRecentPosTransactions(): Promise<PaginatedBaseTransactionResponse | null> {
      if (!this.pointOfSale) return null;
      // Use posApiService for POS-specific operations
      const response = await posApiService.pos.getTransactions(this.pointOfSale.id);
      return response.data;
    },
    async fetchPointOfSale(id: number): Promise<void> {
      // Use posApiService for POS-specific operations
      const response = await posApiService.pos.getSinglePointOfSale(id);
      this.pointOfSaleAssociates = null;
      this.pointOfSale = response.data;
    },
    async fetchPointOfSaleAssociates(posId: number): Promise<void> {
      // Use posApiService for POS-specific operations
      const response = await posApiService.pos.getPointOfSaleAssociates(posId);
      this.pointOfSaleAssociates = response.data;
    },
    async fetchUserPointOfSale(id: number): Promise<void> {
      // Use userApiService for user-level operations
      this.usersPointOfSales = await fetchAllPages<PointOfSaleResponse>((take, skip) =>
        userApiService.user.getUsersPointsOfSale(id, take, skip),
      );
    },
    async fetchAllPointOfSales(): Promise<void> {
      // Use userApiService for user-level operations
      this.allPointOfSales = await fetchAllPages<PointOfSaleResponse>((take, skip) =>
        userApiService.pos.getAllPointsOfSale(take, skip),
      );
    },
    getProduct(productId: number, revision: number, containerId: number): ProductResponse | undefined {
      if (this.pointOfSale) {
        const container = this.pointOfSale.containers.find((c) => c.id === containerId);
        if (container) {
          return container.products.find((p) => p.id === productId && p.revision === revision);
        }
      }
      return undefined;
    },
  },
});
