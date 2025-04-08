import { defineStore } from "pinia";
import type {
    BalanceResponse,
    BaseFineHandoutEventResponse, FineHandoutEventResponse,
    GewisUserResponse,
    UserToFineResponse
} from "@sudosos/sudosos-client";
import ApiService from "@/services/ApiService";
import Dinero, { type DineroObject } from "dinero.js";
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";

export enum SortField {
    NAME = "name",
    FINE = "fine",
    FINE_SINCE = "fineSince",
    REFERENCE_BALANCE = "referenceBalance",
    CONTROL_BALANCE = "controlBalance",
}

export enum SortDirection {
    NONE = 0,
    ASCENDING = -1,
    DESCENDING = 1,
}

export interface DebtorSort {
    field: SortField | null;
    direction: SortDirection | null;
}

export interface DebtorFilter {
    name: string;
}

export interface Debtor {
    fine: UserToFineResponse,
    user: GewisUserResponse,
}

interface FinancialSummary {
    totalNegative: Dinero.DineroObject;
    totalPositive: Dinero.DineroObject;
    total: Dinero.DineroObject;
}

interface DebtorState {
    allDebtors: Debtor[];
    userToFineResponse: UserToFineResponse[];
    isDebtorsLoading: boolean;
    sort: DebtorSort;
    filter: DebtorFilter;
    isFineHandoutEventsLoading: boolean;
    isNotifyLoading: boolean;
    isHandoutLoading: boolean;
    isLockLoading: boolean;
    fineHandoutEvents: BaseFineHandoutEventResponse[];
    totalFineHandoutEvents: number;
    summary: FinancialSummary;
}

export const useDebtorStore = defineStore('debtor', {
    state: (): DebtorState => ({
        allDebtors: [],
        userToFineResponse: [],
        isDebtorsLoading: true,
        sort: {
            field: SortField.REFERENCE_BALANCE,
            direction: SortDirection.ASCENDING,
        },
        filter: {
            name: ""
        },
        isFineHandoutEventsLoading: true,
        isNotifyLoading: false,
        isHandoutLoading: false,
        isLockLoading: false,
        fineHandoutEvents: [],
        totalFineHandoutEvents: 10,
        summary: {
            totalNegative: { amount: 0, currency: "EUR", precision: 2 },
            totalPositive: { amount: 0, currency: "EUR", precision: 2 },
            total: { amount: 0, currency: "EUR", precision: 2 },
        }
    }),
    getters: {
        debtors(state) {
            const debtors = state.allDebtors.filter((u) => {
                return (u.fine.balances[0].firstName
                + " "
                + u.fine.balances[0].lastName)
                .toLowerCase()
                    .includes(state.filter.name.toLowerCase());
            });
            switch (state.sort.field) {
                case SortField.NAME: {
                    debtors.sort((a, b) => {
                        const aFullName = (
                            a.fine.balances[0].firstName + " " + a.fine.balances[0].lastName
                        ).toLowerCase();
                        const bFullName = (
                            b.fine.balances[0].firstName + " " + b.fine.balances[0].lastName
                        ).toLowerCase();

                        return ((aFullName > bFullName)
                                ? 1 : -1)
                            * (state.sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.FINE: {
                    debtors.sort((a, b) => {
                        return ((a.fine.balances[0].fine?.amount || 0) - (b.fine.balances[0].fine?.amount || 0))
                            * (state.sort.direction || 1);
                    });
                    break;
                }
                case SortField.FINE_SINCE: {
                    debtors.sort((a, b) => {
                        const dateA = a.fine.balances[0].fineSince
                            ? new Date(a.fine.balances[0].fineSince)
                            : new Date();
                        const dateB = b.fine.balances[0].fineSince
                            ? new Date(b.fine.balances[0].fineSince)
                            : new Date();
                        return (dateA.getTime() - dateB.getTime()) * (state.sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.REFERENCE_BALANCE: {
                    debtors.sort((a, b) => {
                        return (a.fine.balances[0].amount.amount - b.fine.balances[0].amount.amount)
                            * (state.sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.CONTROL_BALANCE: {
                    debtors.sort((a, b) => {
                        return (a.fine.balances[1].amount.amount - b.fine.balances[1].amount.amount)
                            * (state.sort.direction || 1)*-1;
                    });
                    break;
                }
            }

            return debtors;
        },
        totalDebt(state): DineroObject {
            return {
                amount: state.allDebtors
                    .reduce((accumulator: number, current: Debtor) => {
                        return accumulator + current.fine.balances[0].amount.amount;
                    }, 0),
                currency: "EUR",
                precision: 2
            };
        },
        totalFine(state): DineroObject {
            return {
                amount: state.allDebtors
                    .reduce((accumulator: number, current: Debtor) => {
                        return accumulator + current.fine.fineAmount.amount; // Use getAmount() to access the value
                    }, 0),
                currency: "EUR",
                precision: 2
            };
        }
    },
    actions: {
        /**
         * Calculates and populates the user state
         *
         * @param primaryDate The first date for fine calculation
         * @param secondaryDate The second date for fine calculation (usually today)
         * @param userIds Only fetch of these user ids
         */
        async fetchCalculatedFines(primaryDate: Date, secondaryDate?: Date, userIds?: number[]) {
            this.isDebtorsLoading = true;
            const dates = [primaryDate.toISOString()];
            if (secondaryDate) {
                dates.push(secondaryDate.toISOString());
            }

            // Don't calculate fines for ORGAN, VOUCHER, LOCAL_ADMIN, INVOICE, AUTOMATIC_INVOICE
            this.userToFineResponse = (await ApiService.debtor.calculateFines(dates, [
                "MEMBER",
                "LOCAL_USER",
            ])).data;

            await this.fetchDebtors(userIds);
            this.isDebtorsLoading = false;
        },
        /**
         * Fetches the user responses associated with all the UserToFineResponses
         * Useful for retrieving the GEWIS id
         * @param userIds Only fetch these userIds
         */
        async fetchDebtors(userIds?: number[]) {
            const users = await Promise.all(
                this.userToFineResponse
                    .filter((user) => userIds ? userIds.includes(user.id) : true)
                    .map((user) => {
                    return ApiService.user.getIndividualUser(user.id);
                }),
            );

            const allDebtors = [];

            for (const i in users) {
                allDebtors.push({
                    user: users[i].data,
                    fine: this.userToFineResponse[i]
                });
            }

            this.allDebtors = allDebtors;
        },
        /**
         * Fetch the financial summary of SudoSOS
         */
        async fetchFinancialSummary() {
            if (this.summary.totalPositive.amount != 0) return;

            // @ts-ignore
            const allBalances = await fetchAllPages<BalanceResponse>(async (take, skip) => {
                return  ApiService.balance.getAllBalance(
                    undefined,undefined,undefined,undefined,undefined,
                    // @ts-ignore
                    undefined,[ "MEMBER", "LOCAL_USER" ],undefined,undefined, undefined,
                    take, skip
                );
            });

            let totalNegative = Dinero({
               amount: 0,
               currency: "EUR",
               precision: 2
            });
            let totalPositive = Dinero({
                amount: 0,
                currency: "EUR",
                precision: 2
            });

            for (const balance of allBalances) {
                if (balance.amount.amount <= 0) {
                    totalNegative = totalNegative.add(
                        Dinero(balance.amount as Dinero.Options)
                    );
                } else {
                    totalPositive = totalPositive.add(
                        Dinero(balance.amount as Dinero.Options)
                    );
                }
            }
            this.summary.totalNegative = totalNegative.toObject();
            this.summary.totalPositive = totalPositive.toObject();
            this.summary.total =  totalNegative.add(totalPositive).toObject();
        },
        async fetchFineHandoutEvents(take: number, skip: number) {
            this.isFineHandoutEventsLoading = true;
            const handoutEvents = await ApiService.debtor.returnAllFineHandoutEvents(take, skip);

            this.fineHandoutEvents = handoutEvents.data.records;
            this.totalFineHandoutEvents = handoutEvents.data._pagination.count;
            this.isFineHandoutEventsLoading = false;
        },
        async fetchSingleHandoutEvent(id: number): Promise<FineHandoutEventResponse | undefined> {
            return (await ApiService.debtor.returnSingleFineHandoutEvent(id)).data;
        },
        async notifyFines(userIds: number[], referenceDate: Date) {
            this.isNotifyLoading = true;
            await ApiService.debtor.notifyAboutFutureFines({
                userIds: userIds,
                referenceDate: referenceDate.toISOString()
            });
            this.isNotifyLoading = false;
        },
        async handoutFines(userIds: number[], referenceDate: Date) {
            this.isHandoutLoading = true;
            await ApiService.debtor.handoutFines({
                userIds: userIds,
                referenceDate: referenceDate.toISOString()
            });
            this.isHandoutLoading = false;
        },
        async cannotGoIntoDebt(userIds: number[]) {
            this.isLockLoading = true;

            const requests = userIds.map((id) => {
               return ApiService.user.updateUser(id, {
                   canGoIntoDebt: false
               });
            });

            await Promise.all(requests);

            this.isLockLoading = false;
        }
    }
});