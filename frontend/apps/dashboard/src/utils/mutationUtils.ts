import type {
  BaseTransactionResponse,
  BaseUserResponse,
  FinancialMutationResponse,
  PaginatedFinancialMutationResponse,
  TransferResponse,
  Dinero,
  PaginatedBaseTransactionResponse,
} from '@sudosos/sudosos-client';

import i18n from '@/utils/i18nUtils';

const t = i18n.global.t;

export enum FinancialMutationType {
  INVOICE,
  DEPOSIT,
  PAYOUT_REQUEST,
  FINE,
  WAIVED_FINE,
  TRANSACTION,
}

export interface FinancialMutation {
  amount: Dinero;
  to: BaseUserResponse | undefined;
  from: BaseUserResponse | undefined;
  type: FinancialMutationType;
  moment: Date;
  id: number;
  pos?: string;
  createdBy?: BaseUserResponse | undefined;
  editedAt?: Date | undefined;
}

export function parseTransaction(transaction: BaseTransactionResponse): FinancialMutation {
  return {
    amount: transaction.value,
    to: undefined,
    from: transaction.from,
    type: FinancialMutationType.TRANSACTION,
    moment: new Date(transaction.createdAt!),
    id: transaction.id,
    pos: transaction.pointOfSale.name,
    createdBy: transaction.createdBy,
    editedAt: transaction.updatedAt !== transaction.createdAt ? new Date(transaction.updatedAt!) : undefined,
  };
}

export function parseTransfer(transfer: TransferResponse): FinancialMutation {
  let type = FinancialMutationType.DEPOSIT;

  if (transfer.invoice) {
    type = FinancialMutationType.INVOICE;
  } else if (transfer.deposit) {
    type = FinancialMutationType.DEPOSIT;
  } else if (transfer.payoutRequest) {
    type = FinancialMutationType.PAYOUT_REQUEST;
  } else if (transfer.fine) {
    type = FinancialMutationType.FINE;
  } else if (transfer.waivedFines) {
    type = FinancialMutationType.WAIVED_FINE;
  }

  return {
    amount: transfer.amount,
    to: transfer.to,
    from: transfer.from,
    type: type,
    moment: new Date(transfer.updatedAt!),
    id: transfer.id,
  };
}

export function isPaginatedBaseTransactionResponse(obj: unknown): obj is PaginatedBaseTransactionResponse {
  return (
    (obj as PaginatedBaseTransactionResponse).records &&
    (obj as PaginatedBaseTransactionResponse).records.length > 0 &&
    'id' in (obj as PaginatedBaseTransactionResponse).records[0]!
  );
}

export function parseFinancialMutations(
  mutations: PaginatedFinancialMutationResponse | PaginatedBaseTransactionResponse,
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
      return t('components.mutations.modal.payment');
    }
    case FinancialMutationType.DEPOSIT: {
      return t('components.mutations.modal.topUp');
    }
    case FinancialMutationType.FINE: {
      return t('components.mutations.modal.fine');
    }
    case FinancialMutationType.WAIVED_FINE: {
      return t('components.mutations.modal.waivedFine');
    }
    case FinancialMutationType.INVOICE: {
      return t('components.mutations.modal.invoice');
    }
    default: {
      return t('components.mutations.modal.unknown');
    }
  }
}

export function isIncreasingTransfer(mutationType: FinancialMutationType): boolean {
  return (
    mutationType == FinancialMutationType.DEPOSIT ||
    mutationType == FinancialMutationType.INVOICE ||
    mutationType == FinancialMutationType.WAIVED_FINE
  );
}

export function isFine(mutationType: FinancialMutationType): boolean {
  return mutationType == FinancialMutationType.FINE;
}

export function isTransaction(mutationType: FinancialMutationType): boolean {
  return mutationType == FinancialMutationType.TRANSACTION;
}
