import { ref, computed } from 'vue';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';

export function useIsWrapped() {
  const isWrapped = ref(false);

  const fetchWrappedState = async () => {
    const response = await apiService.serverSettings.getWrappedEnabled();
    isWrapped.value = typeof response.data === 'boolean' ? response.data : response.data.enabled;
  };

  // Fetch immediately when composable is called
  void fetchWrappedState();

  const canOverride = computed(() => isAllowed('update', 'all', 'ServerSettings', ['wrappedEnabled']));

  return {
    isWrapped,
    canOverride,
    fetchWrappedState,
  };
}
