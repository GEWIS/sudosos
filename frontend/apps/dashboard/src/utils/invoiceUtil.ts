import type * as yup from 'yup';
import type {
  CreateInvoiceRequest,
  InvoiceEntryResponse,
  InvoiceResponse,
  TransactionResponse,
} from '@gewis/sudosos-client';
import type { createInvoiceObject } from '@/utils/validation-schema';

export function isDirty(invoice: InvoiceResponse): boolean {
  const entryTotal = invoice.invoiceEntries.reduce((sum, entry) => sum + entry.priceInclVat.amount * entry.amount, 0);
  if (!invoice.transfer) return false;
  return entryTotal !== invoice.transfer.amountInclVat.amount;
}

/**
 * Builds the request for POST /invoices from the create form.
 */
export function toCreateInvoiceRequest(
  values: yup.InferType<typeof createInvoiceObject>,
  byId: number,
): CreateInvoiceRequest {
  return {
    forId: values.forId,
    byId,
    addressee: values.addressee,
    description: values.description,
    reference: values.reference,
    transactionIDs: values.transactionIDs,
    street: values.street,
    postalCode: values.postalCode,
    city: values.city,
    country: values.country,
    date: values.date,
    attention: values.attention,
    amount: values.transactionTotal,
  };
}

/**
 * The invoice entries the backend creates for these transactions: one per sub-transaction row.
 */
export function transactionsToInvoiceEntries(transactions: TransactionResponse[]): InvoiceEntryResponse[] {
  return transactions
    .flatMap((transaction) => transaction.subTransactions)
    .flatMap((subTransaction) => subTransaction.subTransactionRows)
    .map((row) => ({
      description: row.product.name,
      amount: row.amount,
      priceInclVat: row.product.priceInclVat,
      vatPercentage: row.product.vat.percentage,
      custom: false,
    }));
}
