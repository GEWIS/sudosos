import type { InvoiceResponse } from "@sudosos/sudosos-client";

export function isDirty(invoice: InvoiceResponse): boolean {
  const entryTotal = invoice.invoiceEntries.reduce((sum, entry) => sum + entry.priceInclVat.amount * entry.amount, 0);
  if (!invoice.transfer) return false;
  return entryTotal !== invoice.transfer.amountInclVat.amount;
}
