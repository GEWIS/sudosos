import { computed, type Ref } from 'vue';
import type { DineroObjectResponse, InvoiceEntryResponse, InvoiceResponse } from '@sudosos/sudosos-client';
import { isDirty } from '@/utils/invoiceUtil';
import i18n from '@/utils/i18nUtils';

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
};

const t = i18n.global.t;
export function useInvoiceEntries(invoice: Ref<InvoiceResponse>) {
  // Build product entries
  const productEntries = computed<RowEntry[]>(() =>
    invoice.value.invoiceEntries.map((entry) => ({
      ...entry,
      custom: false,
      class: {},
    })),
  );

  // VAT entries (for VAT card)
  const vatEntries = computed<VatEntry[]>(() => {
    const map = new Map<number, VatEntry>();
    invoice.value.invoiceEntries.forEach((entry) => {
      const totalInclVat = entry.priceInclVat.amount * entry.amount;
      const base = Math.round(totalInclVat / (1 + entry.vatPercentage / 100));
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
    return Array.from(map.values());
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
      {
        description: t('common.incl'),
        amount: 1,
        vatPercentage: 0,
        priceInclVat: inclVat.value,
        custom: false,
        class: {},
      },
    ];

    // Add transfer warning row if needed
    if (invoice.value.transfer && isDirty(invoice.value)) {
      rows.push({
        description: t('modules.financial.invoice.transfer'),
        amount: 1,
        vatPercentage: 0,
        priceInclVat: invoice.value.transfer.amountInclVat,
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
    } as DineroObjectResponse;
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
