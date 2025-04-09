import { defineStore } from "pinia";
import type {
    BalanceResponse,
    BaseInvoiceResponse,
    InvoiceResponse,
    PaginatedInvoiceResponse,
    UpdateInvoiceRequest
} from "@sudosos/sudosos-client";
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";
import ApiService from "@/services/ApiService";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";

export const useInvoiceStore = defineStore('invoice', {
    state: () => ({
      invoices: {} as Record<number, InvoiceResponse>,
      negativeInvoiceUsers: {} as Record<number, BalanceResponse>,
    }),
    getters: {
        getInvoice: (state) => (id: number): InvoiceResponse | undefined => {
            return state.invoices[id];
        },
        getAll(state): Record<number, InvoiceResponse> {
            return state.invoices;
        },
        getNegativeInvoiceUsers(state): Record<number, BalanceResponse> {
            return state.negativeInvoiceUsers;
        },
    },
    actions: {
        async updateInvoice(id: number, updateInvoiceRequest: UpdateInvoiceRequest): Promise<InvoiceResponse> {
            return await ApiService.invoices.updateInvoice(id,updateInvoiceRequest).then((res) => {
                const invoice: BaseInvoiceResponse = res.data;
                // BaseInvoice does not contain entries, so we merge them
                this.invoices[invoice.id] = { ...this.invoices[invoice.id], ...invoice };
                return this.invoices[invoice.id];
            });
        },
        async getOrFetchInvoice(id: number): Promise<InvoiceResponse> {
            if (this.invoices[id]) {
                return this.invoices[id];
            }
            return this.fetchInvoice(id);
        },
        async deleteInvoice(id: number): Promise<void> {
            await ApiService.invoices.updateInvoice(id, { state: InvoiceStatusResponseStateEnum.Deleted })
              .then((res) => {
                const invoice: BaseInvoiceResponse = res.data;
                this.invoices[invoice.id] = { ...this.invoices[invoice.id], ...invoice };
                return this.invoices[invoice.id];
            });
        },
        async fetchInvoicePdf(id: number): Promise<string> {
            return await ApiService.invoices.getInvoicePdf(id).then((res) => {
                const pdf = (res.data as any).pdf;
                this.invoices[id].pdf = pdf;
                return pdf;
            });
        },
        async fetchInvoice(id: number): Promise<InvoiceResponse> {
            return await ApiService.invoices.getSingleInvoice(id).then((res) => {
                const invoice = res.data;
                this.invoices[invoice.id] = invoice;
                return this.invoices[invoice.id];
            });
        },
        async fetchInvoices(take: number, skip: number,
                    q: { state?: InvoiceStatusResponseStateEnum, fromDate?: string, tillDate?: string }):
          Promise<PaginatedInvoiceResponse> {
            const { state, fromDate, tillDate } = q;
            // Following line has a bug in the swagger generator
            // @ts-ignore
            return await ApiService.invoices.getAllInvoices(undefined, undefined, state ? state : undefined,
              undefined, fromDate, tillDate, take, skip).then((res) => {
                const invoices = res.data.records as InvoiceResponse[];
              invoices.forEach((invoice) => {
                    this.invoices[invoice.id] = invoice;
                });
                return res.data;
            });
        },
        async fetchAllIfEmpty() {
            if (Object.keys(this.invoices).length === 0) {
                await this.fetchAll();
            }
        },
        async fetchAll(): Promise<Record<number, InvoiceResponse>> {
            return fetchAllPages<InvoiceResponse>(
              // @ts-ignore
              (take, skip) => ApiService.invoices.getAllInvoices(null, null, null, null, null, null, take, skip)
            ).then((invoices) => {
                invoices.forEach((invoice: InvoiceResponse) => {
                    this.invoices[invoice.id] = invoice;
                });
                return this.invoices;
            });
        },
        async fetchUsersIfEmpty() {
            if (Object.keys(this.negativeInvoiceUsers).length === 0) {
                await this.fetchAllNegativeInvoiceUsers();
            }
        },
        async fetchAllNegativeInvoiceUsers(): Promise<Record<number, BalanceResponse>> {
            return fetchAllPages<BalanceResponse>(
              // @ts-ignore
              (take, skip) => ApiService.balance.getAllBalance(null, null, -1, null, null, null,
                  "INVOICE", null, null, false, take, skip)
            ).then((users) => {
                users.forEach((user: BalanceResponse) => {
                    this.negativeInvoiceUsers[user.id] = user;
                });
                return this.negativeInvoiceUsers;
            });
        },
    }
});
