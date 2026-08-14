import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { DataTablePageEvent } from 'primevue/datatable';
import type { LocationQuery } from 'vue-router';

export interface QueryParamSync<F> {
  yearKey?: string;
  searchKey?: string;
  serializeFilters?: (filters: F) => Record<string, string | undefined>;
  deserializeFilters?: (query: LocationQuery) => Partial<F>;
}

export function useDataTableYear<T, F extends Record<string, unknown>>(
  fetchRecords: (params: {
    year: number;
    page: number;
    rows: number;
    filters: F;
  }) => Promise<{ records: T[]; _pagination: { count: number } }>,
  fetchSingleRecord?: (id: number) => Promise<T>,
  options?: {
    yearList: number[];
    defaultYear: number;
    initialFilters?: F;
    defaultRows?: number;
    queryParamSync?: QueryParamSync<F>;
  },
) {
  const qps = options?.queryParamSync;
  const route = useRoute();
  const DEFAULT_YEAR_KEY = 'year';

  // --- Initialize state, optionally from URL query params ---
  const defaultYearNum = options?.defaultYear ?? options?.yearList?.[0];
  let yearInit = defaultYearNum?.toString() ?? '';
  if (qps) {
    const key = qps.yearKey ?? DEFAULT_YEAR_KEY;
    const q = route.query[key];
    if (typeof q === 'string' && q) {
      const parsed = Number(q);
      const validYears = options?.yearList;
      if (!isNaN(parsed) && (!validYears || validYears.includes(parsed))) {
        yearInit = q;
      }
    }
  }
  const year = ref(yearInit);

  const page = ref(0);
  const rows = ref(options?.defaultRows ?? 10);

  let filtersInit = { ...(options?.initialFilters || {}) } as F;
  if (qps?.deserializeFilters) {
    const fromQuery = qps.deserializeFilters(route.query);
    // Only apply defined values so URL absence does not override initialFilters
    const defined = Object.fromEntries(Object.entries(fromQuery).filter(([, v]) => v !== undefined)) as Partial<F>;
    filtersInit = { ...filtersInit, ...defined } as F;
  }
  const filters = ref(filtersInit);

  let searchInit = '';
  if (qps?.searchKey) {
    const q = route.query[qps.searchKey];
    if (typeof q === 'string' && q) searchInit = q;
  }
  const search = ref(searchInit);

  const isLoading = ref(false);
  const records = ref<T[]>([]);
  const totalRecords = ref(0);

  // Uses window.history.replaceState directly to avoid triggering navigation guards,
  // which can cause infinite redirect loops in apps with complex guard logic.
  function syncToUrl() {
    if (!qps) return;
    const yearKey = qps.yearKey ?? DEFAULT_YEAR_KEY;
    const raw: Record<string, string | undefined> = {
      [yearKey]: year.value || undefined,
      ...(qps.serializeFilters ? qps.serializeFilters(filters.value) : {}),
      ...(qps.searchKey ? { [qps.searchKey]: search.value || undefined } : {}),
    };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(raw)) {
      if (v !== undefined) params.set(k, v);
    }
    const qs = params.toString();
    window.history.replaceState(window.history.state, '', `${route.path}${qs ? `?${qs}` : ''}`);
  }

  // --- Core logic ---
  async function reload() {
    isLoading.value = true;
    records.value = new Array(rows.value) as T[];
    const resp = await fetchRecords({
      year: Number(year.value),
      page: page.value,
      rows: rows.value,
      filters: filters.value,
    });
    records.value = resp.records;
    totalRecords.value = resp._pagination.count || 0;
    isLoading.value = false;
  }

  function onPage(event: DataTablePageEvent) {
    page.value = event.first;
    rows.value = event.rows;
    void reload();
  }

  function setFilter<K extends keyof F>(key: K, value: F[K]) {
    filters.value[key] = (value === null ? undefined : value) as F[K];
    page.value = 0;
    void reload();
  }

  async function onSingle(id?: number) {
    if (!id || isNaN(id)) return reload();
    page.value = 0;
    if (fetchSingleRecord) {
      isLoading.value = true;
      records.value = [await fetchSingleRecord(id)];
      totalRecords.value = 1;
      isLoading.value = false;
    }
  }

  // Reload when year or filters change
  watch([year, filters], () => {
    page.value = 0;
    void reload();
  });

  // Sync URL on year, filter, or search change
  if (qps) {
    watch([year, search], syncToUrl);
    watch(filters, syncToUrl, { deep: true });
  }

  onMounted(() => {
    // If a search ID was restored from the URL, show that single record immediately
    if (qps?.searchKey && search.value) {
      const id = Number(search.value);
      if (!isNaN(id) && id > 0) {
        void onSingle(id).catch(() => void reload());
        return;
      }
    }
    void reload();
  });

  return {
    year,
    page,
    rows,
    filters,
    search,
    isLoading,
    records,
    totalRecords,
    reload,
    onPage,
    setFilter,
    onSingle,
  };
}
