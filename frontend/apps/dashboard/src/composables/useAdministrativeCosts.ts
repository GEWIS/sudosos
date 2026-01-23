import { ref, computed, onMounted } from 'vue';
import type { DataTablePageEvent } from 'primevue/datatable';
import { debounce } from '@/utils/debounceUtil';
import { useAdministrativeCostsStore } from '@/stores/administrativeCosts.store';

export function useAdministrativeCosts() {
  const store = useAdministrativeCostsStore();

  const filters = ref<{
    fromId?: number;
    inactiveAdministrativeCostId?: number;
  }>({});

  const rows = ref(10);
  const skip = ref(0);
  const rowsPerPageOptions = [10, 25, 50, 100];

  async function fetchCosts() {
    await store.fetchCosts({
      ...filters.value,
      take: rows.value,
      skip: skip.value,
    });
  }

  const delayedFetch = debounce(fetchCosts, 250);

  function onPage(event: DataTablePageEvent) {
    rows.value = event.rows;
    skip.value = event.first;
    void fetchCosts();
  }

  function setFilter<K extends keyof typeof filters.value>(key: K, value: (typeof filters.value)[K]) {
    filters.value[key] = value;
    skip.value = 0;
    void delayedFetch();
  }

  function clearFilters() {
    filters.value = {};
    skip.value = 0;
    void fetchCosts();
  }

  onMounted(() => {
    void fetchCosts();
  });

  return {
    costs: computed(() => store.costs),
    pagination: computed(() => store.pagination),
    isLoading: computed(() => store.isLoading),
    filters,
    rows,
    skip,
    rowsPerPageOptions,
    fetchCosts,
    onPage,
    setFilter,
    clearFilters,
  };
}
