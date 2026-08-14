import { defineStore } from 'pinia';
import type {
  BalanceResponse,
  BaseInvoiceResponse,
  InvoiceResponse,
  InvoiceResponseTypes,
  PaginatedInvoiceResponse,
  UpdateInvoiceRequest,
} from '@gewis/sudosos-client';
import { InvoiceStatusResponseStateEnum, UserType } from '@gewis/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import ApiService from '@/services/ApiService';

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- tsc still needs this without a state return-type annotation
    invoices: {} as Record<number, InvoiceResponse>,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- tsc still needs this without a state return-type annotation
    negativeInvoiceUsers: {} as Record<number, BalanceResponse>,
  }),
  getters: {
    getInvoice:
      (state) =>
      (id: number): InvoiceResponse | undefined => {
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
    async updateInvoice(id: number, updateInvoiceRequest: UpdateInvoiceRequest): Promise<BaseInvoiceResponse> {
      return await ApiService.invoices
        .updateInvoice({ id, updateInvoiceRequest })
        .then((res: { data: BaseInvoiceResponse }) => {
          const invoice: BaseInvoiceResponse = res.data;
          if (!this.invoices[invoice.id]) return invoice;
          // BaseInvoice does not contain entries, so we merge them
          this.invoices[invoice.id] = { ...this.invoices[invoice.id]!, ...invoice };
          return this.invoices[invoice.id]!;
        });
    },
    async getOrFetchInvoice(id: number): Promise<InvoiceResponse> {
      if (this.invoices[id]) {
        return this.invoices[id];
      }
      return this.fetchInvoice(id);
    },
    async deleteInvoice(id: number): Promise<void> {
      await ApiService.invoices
        .updateInvoice({ id, updateInvoiceRequest: { state: InvoiceStatusResponseStateEnum.Deleted } })
        .then((res: { data: BaseInvoiceResponse }) => {
          const invoice: BaseInvoiceResponse = res.data;
          if (!this.invoices[invoice.id]) return undefined;
          this.invoices[invoice.id] = { ...this.invoices[invoice.id]!, ...invoice };
          return this.invoices[invoice.id];
        });
    },
    async fetchInvoicePdf(id: number): Promise<string | undefined> {
      return await ApiService.invoices.getInvoicePdf({ id }).then((res) => {
        const pdf = res.data.pdf;
        if (!this.invoices[id]) return undefined;

        this.invoices[id].pdf = pdf;
        return pdf;
      });
    },
    async fetchInvoice(id: number): Promise<InvoiceResponse> {
      return await ApiService.invoices.getSingleInvoice({ id }).then((res: { data: InvoiceResponse }) => {
        const invoice = res.data;
        this.invoices[invoice.id] = invoice;
        return this.invoices[invoice.id]!;
      });
    },
    async fetchInvoices(
      take: number,
      skip: number,
      q: { state?: InvoiceStatusResponseStateEnum; fromDate?: string; tillDate?: string },
    ): Promise<PaginatedInvoiceResponse> {
      const { state, fromDate, tillDate } = q;
      return await ApiService.invoices
        .getAllInvoices({ currentState: state ? [state] : undefined, fromDate, tillDate, take, skip })
        .then((res) => {
          const invoices = res.data.records;
          invoices.forEach((invoice: InvoiceResponseTypes) => {
            this.invoices[invoice.id] = {
              ...invoice,
              invoiceEntries: invoice.invoiceEntries ?? [],
            };
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
      return fetchAllPages<InvoiceResponseTypes>((take: number, skip: number) =>
        ApiService.invoices.getAllInvoices({ take, skip }),
      ).then((invoices: Array<InvoiceResponseTypes>) => {
        invoices.forEach((invoice) => {
          this.invoices[invoice.id] = invoice as unknown as InvoiceResponse;
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
      return fetchAllPages<BalanceResponse>((take: number, skip: number) =>
        ApiService.balance.getAllBalance({
          maxBalance: -1,
          userTypes: [UserType.Invoice],
          allowDeleted: false,
          take,
          skip,
        }),
      ).then((users: Array<BalanceResponse>) => {
        users.forEach((user: BalanceResponse) => {
          this.negativeInvoiceUsers[user.id] = user;
        });
        return this.negativeInvoiceUsers;
      });
    },
  },
});
