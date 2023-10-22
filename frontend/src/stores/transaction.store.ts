import {createPinia, defineStore} from "pinia";
import type {TransactionResponse} from "@sudosos/sudosos-client";
import type {ApiService} from "@sudosos/sudosos-frontend-common";

interface TransactionModuleState {
    transaction: TransactionResponse | null
}

export const useTransactionStore = defineStore('transaction', {
    state: (): TransactionModuleState => ({
        transaction: null,
    }),
    getters: {},
    actions: {
        async fetchIndividualTransaction (id: number, service: ApiService) {
            this.transaction = (await service.transaction.getSingleTransaction(id)).data;
        }
    },
})