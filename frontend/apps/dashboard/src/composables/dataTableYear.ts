import { ref, watch, onMounted } from 'vue';
import type { DataTablePageEvent } from 'primevue/datatable';

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
  },
) {
  const yearnumber = options?.defaultYear ?? options?.yearList[0];
  const year = ref(yearnumber?.toString() ?? '');
  const page = ref(0);
  const rows = ref(options?.defaultRows ?? 10);
  const filters = ref({ ...(options?.initialFilters || {}) } as F);
  const isLoading = ref(false);
  const records = ref<T[]>([]);
  const totalRecords = ref(0);

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
    filters.value[key] = value;
    page.value = 0;
    void reload();
  }

  async function onSingle(id?: number) {
    if (!id || isNaN(id)) return reload();
    page.value = 0;
    if (fetchSingleRecord) {
      records.value = [await fetchSingleRecord(id)];
    }
  }

  watch([year, filters], () => {
    page.value = 0;
    void reload();
  });

  onMounted(reload);

  return {
    year,
    page,
    rows,
    filters,
    isLoading,
    records,
    totalRecords,
    reload,
    onPage,
    setFilter,
    onSingle,
  };
}
