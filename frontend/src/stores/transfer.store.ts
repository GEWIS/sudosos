import {createPinia, defineStore} from "pinia";
import type {TransferResponse} from "@sudosos/sudosos-client";
import type {ApiService} from "@sudosos/sudosos-frontend-common";

interface TransferStoreModuleState {
    transfer: TransferResponse | null
}

export const useTransferStore = defineStore('transfer', {
    state: (): TransferStoreModuleState => ({
        transfer: null,
    }),
    getters: {},
    actions: {
        async fetchIndividualTransfer(id: number, service: ApiService): Promise<void> {
            this.transfer = (await service.transfers.getSingleTransfer(id)).data;
        }
    },
});