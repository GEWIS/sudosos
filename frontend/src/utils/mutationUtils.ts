import type { BaseTransactionResponse, TransferResponse } from "@sudosos/sudosos-client";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import type { Dinero } from "@sudosos/sudosos-client";
import { formatDateTime, formatPrice } from "@/utils/formatterUtils";
import type { PaginatedBaseTransactionResponse } from "@sudosos/sudosos-client";



export interface MutationTableRow {
    mutationDescription: string,
    mutationMoment: string,
    mutationType: string,
    mutationID: number,
}


/**
 * This should be replaced...
 * @param value
 */
export function formatValueEuro(value: Dinero): string {
    return formatPrice(value);
}

export function parseTransaction(transaction: BaseTransactionResponse): MutationTableRow {
    return {
        mutationDescription: transactionDescription(transaction),
        mutationMoment: formatDateTime(new Date(transaction.createdAt || "")),
        mutationType: 'transaction',
        mutationID: transaction.id,
    };
}

export function parseTransfer(transfer: TransferResponse): MutationTableRow {
    return {
        mutationDescription: transferDescription(transfer),
        mutationMoment: formatDateTime(new Date(transfer.createdAt || "")),
        mutationType: "transfer",
        mutationID: transfer.id
    };
}

export function parseFinancialTransactions(transactions: PaginatedBaseTransactionResponse) : MutationTableRow[] {
    const result: MutationTableRow[] = [];
    transactions.records.forEach((transaction: BaseTransactionResponse) => {
        result.push(parseTransaction(transaction));
    });
    return result;
}

export function transferDescription(transfer: TransferResponse): string {
    if (transfer.deposit) {
        return `You increased your balance with ${formatValueEuro(transfer.amount)}.`;
    } else if (transfer.invoice) {
        return `An invoice valued ${formatValueEuro(transfer.amount)} was added.`;
    } else if (transfer.payoutRequest) {
        // Todo: Currently payoutRequests are not fetched. So this will actually not do anything.
        return `You were refunded ${formatValueEuro(transfer.amount)}.`;
    } else {
        return `An unknown transaction was performed on your account.`; // This is probably not even possible.
    }
}

export function transactionDescription(transaction: BaseTransactionResponse): string {
    const user = useUserStore().getCurrentUser.user;
    if (user === null) return "error";
    const currentUserId: number = user.id;
    const valueOfTransaction: string = formatValueEuro(transaction.value);
    if (transaction.from.id === currentUserId) {
        if (!transaction.createdBy) {
            return `Magically, a transaction of ${valueOfTransaction} was put in.`;
        } else {
            if (transaction.createdBy.id === currentUserId) {
                return `You spent a total of ${valueOfTransaction}.`;
            } else {
                return `${transaction.createdBy.firstName} charged you ${valueOfTransaction}.`;
            }
        }
    } else {
        return `You charged ${transaction.from.firstName} a total of ${valueOfTransaction}.`;
    }
}
