import { defineStore } from 'pinia';
import type { TransactionResponse, TransactionRequest } from '@sudosos/sudosos-client';
import type { ApiService } from '@sudosos/sudosos-frontend-common';

interface TransactionModuleState {
  transactions: Record<number, TransactionResponse>;
}

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionModuleState => ({
    transactions: {} as Record<number, TransactionResponse>,
  }),
  getters: {
    getTransaction:
      (state) =>
      (id: number): TransactionResponse | null => {
        return state.transactions[id] || null;
      },
  },
  actions: {
    async fetchIndividualTransaction(id: number, service: ApiService): Promise<TransactionResponse> {
      if (this.transactions[id]) return this.transactions[id];
      return service.transaction.getSingleTransaction(id).then((res) => {
        this.transactions[id] = res.data;
        return res.data;
      });
    },
    async fetchTransactionsFromPointOfSale(
      service: ApiService,
      pointOfSaleId: number,
      fromDate?: string,
      tillDate?: string,
      take?: number,
      skip?: number,
    ) {
      return await service.transaction.getAllTransactions(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        pointOfSaleId,
        undefined,
        undefined,
        fromDate,
        tillDate,
        take,
        skip,
      );
    },
    async updateTransaction(
      id: number,
      transactionRequest: TransactionRequest,
      service: ApiService,
    ): Promise<TransactionResponse> {
      return await service.transaction.updateTransaction(id, transactionRequest).then((res) => {
        const transaction: TransactionResponse = res.data;
        this.transactions[transaction.id] = transaction;
        return transaction;
      });
    },
  },
});
