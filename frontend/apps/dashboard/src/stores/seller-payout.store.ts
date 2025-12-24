import { defineStore } from 'pinia';
import type {
  CreateSellerPayoutRequest,
  PaginatedSellerPayoutResponse,
  SellerPayoutResponse,
} from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import ApiService from '@/services/ApiService';

export const useSellerPayoutStore = defineStore('seller-payout', {
  state: () => ({
    payouts: {} as Record<number, SellerPayoutResponse>,
  }),
  getters: {
    getPayout:
      (state) =>
      (id: number): SellerPayoutResponse | undefined => {
        return state.payouts[id];
      },
    getAll(state): Record<number, SellerPayoutResponse> {
      return state.payouts;
    },
  },
  actions: {
    async fetchPayout(id: number): Promise<SellerPayoutResponse> {
      return await ApiService.sellerPayouts.getSingleSellerPayout(id).then((res) => {
        const payout = res.data;
        this.payouts[payout.id] = payout;
        return this.payouts[payout.id]!;
      });
    },
    async fetchPayouts(take: number, skip: number): Promise<PaginatedSellerPayoutResponse> {
      return await ApiService.sellerPayouts
        .getAllSellerPayouts(undefined, undefined, undefined, take, skip)
        .then((res) => {
          const payouts = res.data.records;
          payouts.forEach((payout) => {
            this.payouts[payout.id] = payout;
          });
          return res.data;
        });
    },
    async fetchPayoutsBy(requestedById: number, take: number, skip: number): Promise<PaginatedSellerPayoutResponse> {
      return await ApiService.sellerPayouts
        .getAllSellerPayouts(requestedById, undefined, undefined, take, skip)
        .then((res) => {
          const payouts = res.data.records;
          payouts.forEach((payout) => {
            this.payouts[payout.id] = payout;
          });
          return res.data;
        });
    },
    async fetchAllIfEmpty() {
      if (Object.keys(this.payouts).length === 0) {
        await this.fetchAll();
      }
    },
    async fetchAll(): Promise<Record<number, SellerPayoutResponse>> {
      return fetchAllPages<SellerPayoutResponse>((take, skip) =>
        ApiService.sellerPayouts.getAllSellerPayouts(undefined, undefined, undefined, take, skip),
      ).then((payouts) => {
        payouts.forEach((payout: SellerPayoutResponse) => {
          this.payouts[payout.id] = payout;
        });
        return this.payouts;
      });
    },
    async createPayout(c: CreateSellerPayoutRequest) {
      return await ApiService.sellerPayouts.createSellerPayout(c).then((resp) => {
        const payout = resp.data;
        this.payouts[payout.id] = payout;
        return payout;
      });
    },
    async deletePayout(id: number): Promise<boolean> {
      return await ApiService.sellerPayouts.deleteSellerPayout(id).then(() => {
        delete this.payouts[id];
        return true;
      });
    },
    async updatePayoutAmount(id: number, amount: number): Promise<boolean> {
      return await ApiService.sellerPayouts
        .updateSellerPayout(id, {
          amount: {
            amount: Math.round(amount * 100),
            currency: 'EUR',
            precision: 2,
          },
        })
        .then((res) => {
          this.payouts[id] = res.data;
          return true;
        });
    },
  },
});
