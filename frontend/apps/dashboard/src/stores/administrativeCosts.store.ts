import { defineStore } from 'pinia';
import type {
  BaseInactiveAdministrativeCostResponse,
  CreateInactiveAdministrativeCostRequest,
  HandoutInactiveAdministrativeCostsRequest,
  UserToInactiveAdministrativeCostResponse,
} from '@sudosos/sudosos-client';
import ApiService from '@/services/ApiService';

interface AdministrativeCostsState {
  costs: BaseInactiveAdministrativeCostResponse[];
  pagination: {
    take: number;
    skip: number;
    count: number;
  };
  isLoading: boolean;
  isDeleteLoading: boolean;
  isCreateLoading: boolean;
  isNotifyLoading: boolean;
  isHandoutLoading: boolean;
  eligibleUsers: UserToInactiveAdministrativeCostResponse[];
  isEligibleUsersLoading: boolean;
}

export const useAdministrativeCostsStore = defineStore('administrativeCosts', {
  state: (): AdministrativeCostsState => ({
    costs: [],
    pagination: {
      take: 10,
      skip: 0,
      count: 0,
    },
    isLoading: false,
    isDeleteLoading: false,
    isCreateLoading: false,
    isNotifyLoading: false,
    isHandoutLoading: false,
    eligibleUsers: [],
    isEligibleUsersLoading: false,
  }),

  actions: {
    async fetchCosts(filters?: {
      fromId?: number;
      inactiveAdministrativeCostId?: number;
      take?: number;
      skip?: number;
    }) {
      this.isLoading = true;
      try {
        const response = await ApiService.inactiveAdministrativeCosts.getAllInactiveAdministrativeCosts(
          filters?.fromId,
          filters?.inactiveAdministrativeCostId,
        );
        const data = response.data;
        this.costs = data.records || [];
        this.pagination = {
          take: data._pagination?.take || filters?.take || 10,
          skip: data._pagination?.skip || filters?.skip || 0,
          count: data._pagination?.count || 0,
        };
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCost(id: number): Promise<BaseInactiveAdministrativeCostResponse> {
      const response = await ApiService.inactiveAdministrativeCosts.getInactiveAdministrativeCosts(id);
      return response.data;
    },

    async createCost(
      request: CreateInactiveAdministrativeCostRequest,
    ): Promise<BaseInactiveAdministrativeCostResponse> {
      this.isCreateLoading = true;
      try {
        const response = await ApiService.inactiveAdministrativeCosts.createInactiveAdministrativeCosts(request);
        return response.data;
      } finally {
        this.isCreateLoading = false;
      }
    },

    async deleteCost(id: number): Promise<void> {
      this.isDeleteLoading = true;
      try {
        await ApiService.inactiveAdministrativeCosts.deleteInactiveAdministrativeCost(id);
      } finally {
        this.isDeleteLoading = false;
      }
    },

    async fetchEligibleUsers(notification: boolean): Promise<UserToInactiveAdministrativeCostResponse[]> {
      this.isEligibleUsersLoading = true;
      try {
        const response =
          await ApiService.inactiveAdministrativeCosts.getInactiveAdministrativeCostsEligibleUsers(notification);
        this.eligibleUsers = response.data || [];
        return this.eligibleUsers;
      } finally {
        this.isEligibleUsersLoading = false;
      }
    },

    async notifyUsers(request: HandoutInactiveAdministrativeCostsRequest): Promise<void> {
      this.isNotifyLoading = true;
      try {
        await ApiService.inactiveAdministrativeCosts.notifyInactiveAdministrativeCostsUsers(request);
      } finally {
        this.isNotifyLoading = false;
      }
    },

    async handoutCosts(request: HandoutInactiveAdministrativeCostsRequest): Promise<void> {
      this.isHandoutLoading = true;
      try {
        await ApiService.inactiveAdministrativeCosts.handoutInactiveAdministrativeCostsUsers(request);
      } finally {
        this.isHandoutLoading = false;
      }
    },
  },
});
