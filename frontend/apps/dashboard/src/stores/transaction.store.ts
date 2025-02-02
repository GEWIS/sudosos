import { defineStore } from "pinia";
import type { TransactionResponse } from "@sudosos/sudosos-client";
import type { ApiService } from "@sudosos/sudosos-frontend-common";

interface TransactionModuleState {
    transaction: TransactionResponse | null
}

export const useTransactionStore = defineStore('transaction', {
    state: (): TransactionModuleState => ({
        transaction: null,
    }),
    getters: {
        getTransaction(): TransactionModuleState{
            return this;
        }
    },
    actions: {
        async fetchIndividualTransaction (id: number, service: ApiService) {
            this.transaction = (await service.transaction.getSingleTransaction(id)).data;
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
                undefined, undefined, undefined,
                undefined, pointOfSaleId, undefined, undefined,
                fromDate, tillDate, take, skip);
        }
    },
});