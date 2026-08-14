import {
  type PaginatedWriteOffResponse,
  type WriteOffResponse,
  type WriteOffRequest,
  type BalanceResponse,
  GetAllBalanceOrderDirectionEnum,
} from '@gewis/sudosos-client';
import { defineStore } from 'pinia';
import apiService from '@/services/ApiService';

export const useWriteOffStore = defineStore('writeoff', {
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- tsc still needs this without a state return-type annotation
    writeOffs: {} as Record<number, WriteOffResponse & { pdf?: string }>,
    updatedAt: 0,
    inactiveUsers: [] as BalanceResponse[],
    count: 0,
    usersFetchedAt: 0,
  }),
  getters: {
    getWriteOff:
      (state) =>
      (id: number): WriteOffResponse | null => {
        return state.writeOffs[id] || null;
      },
    getUpdatedAt(): number {
      return this.updatedAt;
    },
    getAllWriteOffs(): Record<number, WriteOffResponse> {
      return this.writeOffs;
    },
    getShouldRefresh(): boolean {
      return this.usersFetchedAt === 0 || Date.now() - this.usersFetchedAt > 1000 * 60 * 15;
    },
  },
  actions: {
    async fetchWriteOffs(
      take: number,
      skip: number,
      fromDate: string,
      tillDate: string,
    ): Promise<PaginatedWriteOffResponse> {
      return apiService.writeOffs.getAllWriteOffs({ take, skip, fromDate, tillDate }).then((res) => {
        res.data.records.forEach((writeOff: WriteOffResponse) => {
          this.writeOffs[writeOff.id] = writeOff;
        });
        return res.data;
      });
    },
    async fetchWriteOff(id: number): Promise<WriteOffResponse> {
      if (this.writeOffs[id]) return this.writeOffs[id];
      return apiService.writeOffs.getSingleWriteOff({ id }).then((res) => {
        this.writeOffs[id] = res.data;
        return res.data;
      });
    },
    async fetchPdf(id: number): Promise<string | undefined> {
      return apiService.writeOffs.getWriteOffPdf({ id }).then((res) => {
        const pdf = res.data.pdf;
        if (!this.writeOffs[id]) return undefined;

        this.writeOffs[id].pdf = pdf;
        return pdf;
      });
    },
    async createWriteOff(values: WriteOffRequest): Promise<WriteOffResponse> {
      return apiService.writeOffs.createWriteOff({ writeOffRequest: values }).then((res) => {
        this.writeOffs[res.data.id] = res.data;
        this.updatedAt = Date.now();
        return res.data;
      });
    },
    async fetchInactiveUsers(take: number, skip: number, orderBy = 'amount', orderDirection = 'ASC') {
      const users = await apiService.balance.getAllBalance({
        maxBalance: -1,
        userTypes: ['MEMBER', 'LOCAL_USER'],
        orderBy,
        orderDirection:
          orderDirection === 'ASC' ? GetAllBalanceOrderDirectionEnum.Asc : GetAllBalanceOrderDirectionEnum.Desc,
        allowDeleted: true,
        inactive: true,
        take,
        skip,
      });
      this.usersFetchedAt = Date.now();
      this.inactiveUsers = users.data.records;
      this.count = users.data._pagination?.count || 0;
      return this.inactiveUsers;
    },
  },
});
