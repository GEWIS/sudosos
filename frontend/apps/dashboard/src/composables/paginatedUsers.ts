import { ref, computed, watch, onMounted } from 'vue';
import Fuse from 'fuse.js';
import { FilterMatchMode } from '@primevue/core/api';
import type { UserResponse } from '@sudosos/sudosos-client';
import type { DataTablePageEvent } from 'primevue/datatable';
import apiService from '@/services/ApiService';
import { debounce } from '@/utils/debounceUtil';

export function usePaginatedUsers() {
  const searchQuery = ref('');
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const isActiveFilter = ref(true);
  const ofAgeFilter = ref(true);
  const isLoading = ref(true);
  const totalRecords = ref(0);
  const allUsers = ref<UserResponse[]>([]);
  const rows = ref(10);
  const skip = ref(0);
  const rowsPerPageOptions = [5, 10, 25, 50, 100];

  const allUsersWithFullName = computed(() =>
    allUsers.value.map((user) => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
    })),
  );

  async function apiCall(): Promise<void> {
    isLoading.value = true;
    try {
      const response = await apiService.user.getAllUsers(
        rows.value,
        skip.value,
        searchQuery.value.split(' ')[0] || '',
        isActiveFilter.value ? isActiveFilter.value : undefined,
        ofAgeFilter.value,
        undefined,
        filters.value.type.value || undefined,
      );
      totalRecords.value = response.data._pagination.count || 0;
      allUsers.value = response.data.records;
    } finally {
      isLoading.value = false;
    }
  }

  const delayedAPICall = debounce(apiCall, 250);

  function onPage(event: DataTablePageEvent) {
    rows.value = event.rows;
    skip.value = event.first;
    delayedAPICall();
  }
  function onSort() {
    skip.value = 0;
    delayedAPICall();
  }
  function onFilter() {
    skip.value = 0;
    delayedAPICall();
  }

  watch(
    () => filters.value.global,
    () => {
      skip.value = 0;
      delayedAPICall();
    },
  );
  watch(searchQuery, () => {
    delayedAPICall();
  });

  onMounted(() => {
    void apiCall();
  });

  const sortedUsers = computed(() => {
    if (!searchQuery.value.trim()) return allUsersWithFullName.value;
    return new Fuse(allUsersWithFullName.value, {
      keys: ['fullName'],
      isCaseSensitive: false,
      shouldSort: true,
      threshold: 0.2,
    })
      .search(searchQuery.value)
      .map((r) => r.item);
  });

  return {
    searchQuery,
    filters,
    isActiveFilter,
    ofAgeFilter,
    isLoading,
    totalRecords,
    allUsers,
    rows,
    skip,
    rowsPerPageOptions,
    sortedUsers,
    onPage,
    onSort,
    onFilter,
  };
}
