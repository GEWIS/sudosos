import { defineStore } from 'pinia';
import type { TransactionResponse, TransactionRequest } from '@gewis/sudosos-client';
import type { ApiService } from '@sudosos/sudosos-frontend-common';

interface TransactionModuleState {
  transactions: Record<number, TransactionResponse>;
}

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionModuleState => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- tsc still needs this without a state return-type annotation
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
      return service.transaction.getSingleTransaction({ id }).then((res) => {
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
      return await service.transaction.getAllTransactions({ pointOfSaleId, fromDate, tillDate, take, skip });
    },
    async updateTransaction(
      id: number,
      transactionRequest: TransactionRequest,
      service: ApiService,
    ): Promise<TransactionResponse> {
      return await service.transaction.updateTransaction({ id, transactionRequest }).then((res) => {
        const transaction: TransactionResponse = res.data;
        this.transactions[transaction.id] = transaction;
        return transaction;
      });
    },
  },
});
