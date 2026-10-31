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

export type RowEntry = InvoiceEntryResponse & {
  class?: object;
  description: string;
  amount: number;
  priceInclVat: DineroObjectResponse;
  vatPercentage: number;
  custom?: boolean;
  muted?: boolean;
};

const t = i18n.global.t;
/**
 * Rows and totals for a list of invoice entries.
 * `transfer` is the invoice's transfer; an invoice that is not created yet has none.
 */
export function useInvoiceEntries(entries: Ref<InvoiceEntryResponse[]>, transfer: Ref<TransferResponse | undefined>) {
  // Build product entries
  const productEntries = computed<RowEntry[]>(() =>
    entries.value.map((entry) => ({
      ...entry,
      custom: false,
      class: {},
    })),
  );

  // VAT entries (for VAT card)
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
  const totalRows = computed<RowEntry[]>(() => {
    const rows: RowEntry[] = [
      {
        description: t('common.excl'),
        amount: 1,
        vatPercentage: 0,
        priceInclVat: exclVat.value,
        custom: false,
        class: {},
      },
      // One row per VAT rate, like the VAT summary on the invoice PDF.
      ...vatEntries.value.map((vat) => ({
        description: t('modules.financial.invoice.vat.over', {
          percentage: vat.vatPercentage,
          base: formatPrice(vat.baseAmount),
        }),
        amount: 1,
        vatPercentage: vat.vatPercentage,
        priceInclVat: vat.vatAmount,
        custom: false,
        muted: true,
        class: {},
      })),
      {
        description: t('common.incl'),
        amount: 1,
        vatPercentage: 0,
        priceInclVat: inclVat.value,
        custom: false,
        class: {},
      },
    ];

    // Add a warning row if the entries do not add up to the transfer (see isDirty)
    if (transfer.value && inclVat.value.amount !== transfer.value.amountInclVat.amount) {
      rows.push({
        description: t('modules.financial.invoice.transfer'),
        amount: 1,
        vatPercentage: 0,
        priceInclVat: transfer.value.amountInclVat,
        custom: false,
        class: { 'text-red-500': true },
      });
    }

    return rows;
  });

  // allRows: products + totals/warning
  const allRows = computed<RowEntry[]>(() => [...productEntries.value, ...totalRows.value]);
  const totalRowCutoff = computed(() => productEntries.value.length);

  // rowTotal helper
  function rowTotal(row: RowEntry): DineroObjectResponse {
    return {
      ...row.priceInclVat,
      amount: row.amount * row.priceInclVat.amount,
    };
  }

  return {
    productEntries,
    totalRows,
    allRows,
    totalRowCutoff,
    rowTotal,
    vatEntries,
  };
}
