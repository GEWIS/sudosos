import type { BaseTransactionResponse, BaseUserResponse, TransferResponse } from "@sudosos/sudosos-client";
import type { Dinero } from "@sudosos/sudosos-client";
import type { PaginatedBaseTransactionResponse } from "@sudosos/sudosos-client";


export enum FinancialMutationType {
    INVOICE,
    DEPOSIT,
    PAYOUT_REQUEST,
    FINE,
    WAIVED_FINE,
    TRANSACTION
}

export interface FinancialMutation {
    amount: Dinero,
    to: BaseUserResponse | undefined,
    from: BaseUserResponse | undefined,
    type: FinancialMutationType,
    moment: Date,
    id: number
}

export function parseTransaction(transaction: BaseTransactionResponse): FinancialMutation {
    return {
        amount: transaction.value,
        to: undefined,
        from: transaction.from,
        type: FinancialMutationType.TRANSACTION,
        moment: new Date(transaction.updatedAt!!),
        id: transaction.id
    };
}

export function parseTransfer(transfer: TransferResponse): FinancialMutation {
    let type = FinancialMutationType.DEPOSIT;

    if(transfer.invoice) {
        type = FinancialMutationType.INVOICE;
    } else if(transfer.deposit) {
        type = FinancialMutationType.DEPOSIT;
    } else if(transfer.payoutRequest) {
        type = FinancialMutationType.PAYOUT_REQUEST;
    } else if(transfer.fine) {
        type = FinancialMutationType.FINE;
    } else if(transfer.waivedFines) {
        type = FinancialMutationType.WAIVED_FINE;
    }

    return {
        amount: transfer.amount,
        to: transfer.to,
        from: transfer.from,
        type: type,
        moment: new Date(transfer.updatedAt!!),
        id: transfer.id
    };
}

export function parseFinancialTransactions(transactions: PaginatedBaseTransactionResponse) : FinancialMutation[] {
    const result: FinancialMutation[] = [];
    transactions.records.forEach((transaction: BaseTransactionResponse) => {
        result.push(parseTransaction(transaction));
    });
    return result;
}
