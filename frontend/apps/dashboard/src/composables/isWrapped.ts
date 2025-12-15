import { ref, onMounted } from 'vue';
import apiService from '@/services/ApiService';

export function useIsWrapped() {
  const isWrapped = ref(false);

  const fetchWrappedState = async () => {
    const response = await apiService.serverSettings.getWrappedEnabled();
    isWrapped.value = typeof response.data === 'boolean' ? response.data : response.data.enabled;
  };

  onMounted(() => {
    void fetchWrappedState();
  });

  return {
    isWrapped,
    fetchWrappedState,
  };
}
