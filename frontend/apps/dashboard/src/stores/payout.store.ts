import {
  type BasePayoutRequestResponse,
  type PaginatedBasePayoutRequestResponse,
  type PayoutRequestRequest,
  type PayoutRequestResponse,
} from '@gewis/sudosos-client';
import { defineStore } from 'pinia';
import { PayoutRequestStatusRequestStateEnum } from '@gewis/sudosos-client';
import apiService from '@/services/ApiService';

export type PayoutResponse = PayoutRequestResponse | BasePayoutRequestResponse;
export const usePayoutStore = defineStore('payout', {
  state: () => ({
    payouts: {} as Record<number, PayoutResponse>,
    updatedAt: 0,
    pending: 0,
  }),
  getters: {
    getStatePayout:
      (state) =>
      (payoutState: PayoutRequestStatusRequestStateEnum): PayoutResponse[] => {
        return Object.values(state.payouts).filter((payout) => {
          return payout.status === payoutState;
        });
      },
    getPayout:
      (state) =>
      (id: number): PayoutResponse | null => {
        return state.payouts[id] || null;
      },
    getUpdatedAt(): number {
      return this.updatedAt;
    },
    getAllPayouts(): Record<number, PayoutResponse> {
      return this.payouts;
    },
  },
  actions: {
    async fetchPayouts(
      take: number,
      skip: number,
      q: { status?: string; fromDate?: string; tillDate?: string },
    ): Promise<PaginatedBasePayoutRequestResponse> {
      const { status, fromDate, tillDate } = q;
      return apiService.payouts.getAllPayoutRequests({ status, fromDate, tillDate, take, skip }).then((res) => {
        res.data.records.forEach((payout: BasePayoutRequestResponse) => {
          this.payouts[payout.id] = payout;
        });
        return res.data;
      });
    },
    async fetchPayout(id: number): Promise<PayoutRequestResponse> {
      return apiService.payouts.getSinglePayoutRequest({ id }).then((res) => {
        this.payouts[id] = res.data;
        return res.data;
      });
    },
    async denyPayout(id: number): Promise<PayoutRequestResponse> {
      return apiService.payouts
        .setPayoutRequestStatus({ id, payoutRequestStatusRequest: { state: 'DENIED' } })
        .then((res) => {
          this.payouts[id] = res.data;
          this.pending--;
          this.updatedAt = Date.now();
          return res.data;
        });
    },
    async approvePayout(id: number): Promise<PayoutRequestResponse> {
      return apiService.payouts
        .setPayoutRequestStatus({ id, payoutRequestStatusRequest: { state: 'APPROVED' } })
        .then((res) => {
          this.payouts[id] = res.data;
          this.pending--;
          this.updatedAt = Date.now();
          return res.data;
        });
    },
    async fetchPdf(id: number): Promise<string> {
      return apiService.payouts.getPayoutRequestPdf({ id }).then((res) => {
        const pdf = (res.data as unknown as { pdf: string }).pdf;
        if (!this.payouts[id]) throw new Error('Payout not fetched before loading PDF');

        this.payouts[id].pdf = pdf;
        return pdf;
      });
    },
    async createPayout(values: PayoutRequestRequest): Promise<PayoutRequestResponse> {
      return apiService.payouts.createPayoutRequest({ payoutRequestRequest: values }).then((res) => {
        this.payouts[res.data.id] = res.data;
        this.pending++;
        this.updatedAt = Date.now();
        return res.data;
      });
    },
    async fetchPending(): Promise<number> {
      return apiService.payouts.getAllPayoutRequests({ status: 'CREATED', take: 0, skip: 0 }).then((res) => {
        this.pending = res.data._pagination.count;
        return this.pending;
      });
    },
  },
});
