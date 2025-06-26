import type { TransactionResponse } from '@sudosos/sudosos-client';
import type { SubTransactionResponse, SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';

export function getProductsOfTransaction(transactionResponse: TransactionResponse): SubTransactionRowResponse[] {
  return transactionResponse.subTransactions.flatMap(
    (subTransaction: SubTransactionResponse) => subTransaction.subTransactionRows,
  );
}
