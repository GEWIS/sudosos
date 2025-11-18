import { ref, watch, onMounted } from 'vue';
import type { BannerResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { debounce } from '@/utils/debounceUtil';
import { useBannersStore } from '@/stores/banner.store';

export function usePaginatedBanners() {
  const bannersStore = useBannersStore();
  const activeFilter = ref<boolean | undefined>(undefined);
  const expiredFilter = ref<boolean | undefined>(undefined);
  const order = ref<string>('DESC');
  const isLoading = ref(true);
  const totalRecords = ref(0);
  const banners = ref<BannerResponse[]>([]);
  const rows = ref(5);
  const skip = ref(0);
  const rowsPerPageOptions = [5, 10, 25, 50, 100];

  async function apiCall(): Promise<void> {
    isLoading.value = true;
    try {
      const response = await apiService.banner.getAllBanners(
        rows.value,
        skip.value,
        activeFilter.value,
        expiredFilter.value,
        order.value,
      );
      totalRecords.value = response.data._pagination?.count || 0;
      banners.value = response.data.records || [];
    } finally {
      isLoading.value = false;
    }
  }

  const delayedAPICall = debounce(apiCall, 250);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onPage(event: any) {
    rows.value = event.rows;
    skip.value = event.first;
    delayedAPICall();
  }

  function onSort(newOrder: string) {
    order.value = newOrder;
    skip.value = 0;
    delayedAPICall();
  }

  watch([activeFilter, expiredFilter], () => {
    skip.value = 0;
    delayedAPICall();
  });

  watch(
    () => bannersStore.getLastUpdated,
    () => {
      delayedAPICall();
    },
  );

  onMounted(() => {
    void apiCall();
  });

  return {
    activeFilter,
    expiredFilter,
    order,
    isLoading,
    totalRecords,
    banners,
    rows,
    skip,
    rowsPerPageOptions,
    onPage,
    onSort,
  };
}
