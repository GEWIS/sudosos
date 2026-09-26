import { defineStore } from 'pinia';
import type { PaginatedVoucherGroupResponse, VoucherGroupRequest, VoucherGroupResponse } from '@gewis/sudosos-client';
import apiService from '@/services/ApiService';

export const useVoucherGroupStore = defineStore('voucherGroup', {
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    voucherGroups: {} as Record<number, VoucherGroupResponse>,
    totalRecords: 0,
    isLoading: false,
  }),
  getters: {
    allVoucherGroups(state): VoucherGroupResponse[] {
      return Object.values(state.voucherGroups);
    },
    getVoucherGroup:
      (state) =>
      (id: number): VoucherGroupResponse | null => {
        return state.voucherGroups[id] ?? null;
      },
  },
  actions: {
    async fetchVoucherGroups(take?: number, skip?: number): Promise<PaginatedVoucherGroupResponse> {
      this.isLoading = true;
      try {
        const response = await apiService.voucherGroup.getAllVouchergroups({ take, skip });
        const data = response.data;
        this.totalRecords = data._pagination?.count ?? data.records.length;
        this.voucherGroups = {};
        for (const record of data.records) {
          this.voucherGroups[record.id] = record;
        }
        return data;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchVoucherGroupById(id: number): Promise<VoucherGroupResponse> {
      this.isLoading = true;
      try {
        const response = await apiService.voucherGroup.getVouchergroupId({ id });
        const data = response.data;
        this.voucherGroups[data.id] = data;
        return data;
      } finally {
        this.isLoading = false;
      }
    },

    async createVoucherGroup(request: VoucherGroupRequest): Promise<VoucherGroupResponse> {
      const response = await apiService.voucherGroup.createVouchergroup({
        voucherGroupRequest: request,
      });
      const created = response.data;
      this.voucherGroups[created.id] = created;
      return created;
    },

    async updateVoucherGroup(id: number, request: VoucherGroupRequest): Promise<VoucherGroupResponse> {
      const response = await apiService.voucherGroup.updateVoucherGroup({
        id,
        voucherGroupRequest: request,
      });
      const updated = response.data;
      this.voucherGroups[updated.id] = updated;
      return updated;
    },
  },
});
