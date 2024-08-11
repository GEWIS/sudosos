import type { BaseTransactionResponse, BaseUserResponse, FinancialMutationResponse,
  PaginatedFinancialMutationResponse, TransferResponse } from "@sudosos/sudosos-client";
import type { Dinero } from "@sudosos/sudosos-client";
import type { PaginatedBaseTransactionResponse } from "@sudosos/sudosos-client";

import i18n from '@/utils/i18nUtils';

const t = i18n.global.t;

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
    id: number,
    pos?: String,
    createdBy?: BaseUserResponse | undefined,
}

export function parseTransaction(transaction: BaseTransactionResponse): FinancialMutation {
    return {
        amount: transaction.value,
        to: undefined,
        from: transaction.from,
        type: FinancialMutationType.TRANSACTION,
        moment: new Date(transaction.updatedAt!!),
        id: transaction.id,
        pos: transaction.pointOfSale.name,
        createdBy: transaction.createdBy,
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

export function isPaginatedBaseTransactionResponse(obj: any): obj is PaginatedBaseTransactionResponse {
  return obj.records && obj.records.length > 0 && 'id' in obj.records[0];
}

export function parseFinancialMutations(
  mutations: PaginatedFinancialMutationResponse | PaginatedBaseTransactionResponse
): FinancialMutation[] {
  const result: FinancialMutation[] = [];
  if (isPaginatedBaseTransactionResponse(mutations)) {
    mutations.records.forEach((mutation: BaseTransactionResponse) => {
      result.push(parseTransaction(mutation));
    });
  } else {
    mutations.records.forEach((mutation: FinancialMutationResponse) => {
      if (mutation.type === 'transaction') {
        const transaction = mutation.mutation as BaseTransactionResponse;
        result.push(parseTransaction(transaction));
      } else if (mutation.type === 'transfer') {
        const transfer = mutation.mutation as TransferResponse;
        result.push(parseTransfer(transfer));
      }
    });
  }
  return result;
}

export function getDescription(mutation: FinancialMutation) {
  switch (mutation.type) {
    case FinancialMutationType.TRANSACTION: {
      return t('c_recentTransactionsTable.payment');
    }
    case FinancialMutationType.DEPOSIT: {
      return t('c_recentTransactionsTable.topUp');
    }
    case FinancialMutationType.FINE: {
      return t('c_recentTransactionsTable.fine');
    }
    case FinancialMutationType.WAIVED_FINE: {
      return t('c_recentTransactionsTable.waivedFine');
    }
    case FinancialMutationType.INVOICE: {
      return t('c_recentTransactionsTable.invoice');
    }
    default: {
      return t('c_recentTransactionsTable.unknown');
    }
  }
}

export function isIncreasingTransfer(mutationType: FinancialMutationType): boolean {
    return mutationType == FinancialMutationType.DEPOSIT ||
        mutationType == FinancialMutationType.INVOICE ||
        mutationType == FinancialMutationType.WAIVED_FINE;
}

export function isFine(mutationType: FinancialMutationType): boolean {
    return mutationType == FinancialMutationType.FINE;
}
