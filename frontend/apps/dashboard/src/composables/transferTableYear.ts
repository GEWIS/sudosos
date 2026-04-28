import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { LocationQuery } from 'vue-router';
import { useFiscalYear } from '@/composables/fiscalYear';
import { useDataTableYear } from '@/composables/dataTableYear';

/**
 * Composable for transfer-type DataTables with fiscal year tabs, ID search, and optional URL query-param sync.
 *
 * ## URL initialisation
 * Pass `syncQueryParams: true` (or a `TransferFilterSync` object for filter serialization) to have the
 * composable read its initial state from the URL on mount and keep the URL in sync as state changes:
 *
 *   /financial/invoices?year=2025&id=42&state=CREATED
 *
 * Any page can deep-link to a pre-filtered table by navigating with those params.
 *
 * ## Cross-page filter passing
 * To navigate from another page with pre-populated filters, use `router.push` with the target route
 * and the relevant query params:
 *
 *   router.push({ name: 'invoiceOverview', query: { year: '2025', state: 'CREATED' } })
 *   router.push({ name: 'payoutOverview',  query: { year: '2025', id: '42' } })
 *
 * ## Query param names per table
 * | Table       | `year`             | `id`           | filter keys |
 * | ----------- | ------------------ | -------------- | ----------- |
 * | Invoices    | fiscal year number | invoice ID     | `state`     |
 * | Write-offs  | fiscal year number | write-off ID   | —           |
 * | Payouts     | fiscal year number | payout ID      | `state`     |
 */
export interface TransferFilterSync<F> {
  serializeFilters?: (filters: F) => Record<string, string | undefined>;
  deserializeFilters?: (query: LocationQuery) => Partial<F>;
}

export function useTransferTableYear<T, F extends Record<string, unknown>>(
  fetchRecords: (params: {
    year: number;
    page: number;
    rows: number;
    filters: F;
    fiscalStart: string;
    fiscalEnd: string;
  }) => Promise<{ records: T[]; _pagination: { count: number } }>,
  fetchSingleRecord?: (id: number) => Promise<T>,
  options?: {
    initialFilters?: F;
    defaultRows?: number;
    syncQueryParams?: boolean | TransferFilterSync<F>;
  },
) {
  const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
  const years = getFiscalYearList();
  const { t } = useI18n();
  const toast = useToast();

  async function wrappedFetch(params: { year: number; page: number; rows: number; filters: F }) {
    const { start, end } = getFiscalYearRange(params.year);
    return fetchRecords({ ...params, fiscalStart: start, fiscalEnd: end });
  }

  const syncOpts = options?.syncQueryParams;
  const filterSync: TransferFilterSync<F> | undefined = syncOpts && typeof syncOpts === 'object' ? syncOpts : undefined;

  const table = useDataTableYear<T, F>(wrappedFetch, fetchSingleRecord, {
    yearList: years,
    defaultYear: years[0]!,
    initialFilters: options?.initialFilters,
    defaultRows: options?.defaultRows,
    queryParamSync: syncOpts
      ? {
          yearKey: 'year',
          searchKey: 'id',
          serializeFilters: filterSync?.serializeFilters,
          deserializeFilters: filterSync?.deserializeFilters,
        }
      : undefined,
  });

  function searchById() {
    const id = Number(table.search.value);
    if (isNaN(id)) return;
    table.onSingle(id).catch(() => {
      toast.add({
        severity: 'warn',
        summary: t('common.toast.info.info'),
        detail: t('common.toast.info.notFound'),
        life: 3000,
      });
    });
  }

  return {
    ...table,
    years,
    searchById,
  };
}
