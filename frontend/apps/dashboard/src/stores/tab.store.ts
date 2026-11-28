import type { GetAllTabsStatusEnum, PaginatedTabResponse, TabResponse, UpdateTabRequest } from '@gewis/sudosos-client';
import { defineStore } from 'pinia';
import apiService from '@/services/ApiService';

export const useTabStore = defineStore('tab', {
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- tsc still needs this without a state return-type annotation
    tabs: {} as Record<number, TabResponse>,
  }),
  getters: {
    getTab:
      (state) =>
      (id: number): TabResponse | null =>
        state.tabs[id] || null,
  },
  actions: {
    store(tab: TabResponse): TabResponse {
      this.tabs[tab.id] = tab;
      return tab;
    },
    async fetchTabs(take: number, skip: number, status?: GetAllTabsStatusEnum): Promise<PaginatedTabResponse> {
      const res = await apiService.tabs.getAllTabs({ take, skip, status });
      res.data.records.forEach((tab) => this.store(tab));
      return res.data;
    },
    async fetchTab(id: number): Promise<TabResponse> {
      const res = await apiService.tabs.getSingleTab({ id });
      return this.store(res.data);
    },
    async updateTab(id: number, request: UpdateTabRequest): Promise<TabResponse> {
      const res = await apiService.tabs.updateTab({ id, updateTabRequest: request });
      return this.store(res.data);
    },
    async cancelTab(id: number): Promise<TabResponse> {
      const res = await apiService.tabs.cancelTab({ id });
      return this.store(res.data);
    },
    async cancelPayment(id: number): Promise<TabResponse> {
      const res = await apiService.tabs.cancelTabPayment({ id });
      return this.store(res.data);
    },
    async convertToInvoiceAccount(id: number): Promise<TabResponse> {
      const res = await apiService.tabs.convertTabToInvoiceAccount({ id });
      return this.store(res.data);
    },
    /** Returns the file name of the stored receipt PDF. */
    async fetchReceipt(id: number): Promise<string | undefined> {
      const res = await apiService.tabs.getTabReceipt({ id });
      return res.data.pdf;
    },
    async sendReceipt(id: number): Promise<void> {
      await apiService.tabs.sendTabReceipt({ id });
    },
  },
});
