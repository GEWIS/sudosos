import { computed, type Ref } from 'vue';
import type { DineroObjectResponse, InvoiceEntryResponse, TransferResponse } from '@gewis/sudosos-client';
import i18n from '@/utils/i18nUtils';
import { formatPrice } from '@/utils/formatterUtils';

export interface VatEntry {
  vatPercentage: number;
  baseAmount: DineroObjectResponse;
  amountInclVat: DineroObjectResponse;
  vatAmount: DineroObjectResponse;
}

export type TotalRow = {
  description: string;
  amount: number;
  priceInclVat: DineroObjectResponse;
  muted?: boolean;
  class?: object;
};

const t = i18n.global.t;
/**
 * Rows and totals for a list of invoice entries.
 * `transfer` is the invoice's transfer; an invoice that is not created yet has none.
 */
export function useInvoiceEntries(entries: Ref<InvoiceEntryResponse[]>, transfer: Ref<TransferResponse | undefined>) {
  const vatEntries = computed<VatEntry[]>(() => {
    const map = new Map<number, VatEntry>();
    entries.value.forEach((entry) => {
      const totalInclVat = entry.priceInclVat.amount * entry.amount;
      const base = Math.round(entry.priceInclVat.amount / (1 + entry.vatPercentage / 100)) * entry.amount;
      const vatAmt = totalInclVat - base;
      if (!map.has(entry.vatPercentage)) {
        map.set(entry.vatPercentage, {
          vatPercentage: entry.vatPercentage,
          baseAmount: { amount: 0, precision: 2, currency: 'EUR' },
          amountInclVat: { amount: 0, precision: 2, currency: 'EUR' },
          vatAmount: { amount: 0, precision: 2, currency: 'EUR' },
        });
      }
      const vatEntry = map.get(entry.vatPercentage)!;
      vatEntry.baseAmount.amount += base;
      vatEntry.amountInclVat.amount += totalInclVat;
      vatEntry.vatAmount.amount += vatAmt;
    });
    return Array.from(map.values()).sort((a, b) => a.vatPercentage - b.vatPercentage);
  });

  // Total calculation
  const exclVat = computed<DineroObjectResponse>(() => ({
    amount: vatEntries.value.reduce((sum, v) => sum + v.baseAmount.amount, 0),
    precision: 2,
    currency: 'EUR',
  }));
  const inclVat = computed<DineroObjectResponse>(() => ({
    amount: vatEntries.value.reduce((sum, v) => sum + v.amountInclVat.amount, 0),
    precision: 2,
    currency: 'EUR',
  }));

  // Total rows
  const totalRows = computed<TotalRow[]>(() => {
    const rows: TotalRow[] = [
      {
        description: t('common.excl'),
        amount: 1,
        priceInclVat: exclVat.value,
      },
      // One row per VAT rate, like the VAT summary on the invoice PDF.
      ...vatEntries.value.map((vat) => ({
        description: t('modules.financial.invoice.vat.over', {
          percentage: vat.vatPercentage,
          base: formatPrice(vat.baseAmount),
        }),
        amount: 1,
        priceInclVat: vat.vatAmount,
        muted: true,
      })),
      {
        description: t('common.incl'),
        amount: 1,
        priceInclVat: inclVat.value,
      },
    ];

    // Add a warning row if the entries do not add up to the transfer (see isDirty)
    if (transfer.value && inclVat.value.amount !== transfer.value.amountInclVat.amount) {
      rows.push({
        description: t('modules.financial.invoice.transfer'),
        amount: 1,
        priceInclVat: transfer.value.amountInclVat,
        class: { 'text-red-500': true },
      });
    }

    return rows;
  });

  // rowTotal helper
  function rowTotal(row: Pick<TotalRow, 'amount' | 'priceInclVat'>): DineroObjectResponse {
    return {
      ...row.priceInclVat,
      amount: row.amount * row.priceInclVat.amount,
    };
  }

  return {
    totalRows,
    rowTotal,
  };
}
