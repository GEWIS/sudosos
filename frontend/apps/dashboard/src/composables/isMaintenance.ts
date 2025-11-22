import { computed } from 'vue';
import { useWebSocketStore, isAllowed } from '@sudosos/sudosos-frontend-common';

export function useIsMaintenance() {
  const webSocketStore = useWebSocketStore();

  const override = isAllowed('override', ['all'], 'Maintenance', ['*']);

  return {
    isMaintenance: computed(() => webSocketStore.maintenanceMode),
    canOverride: computed(() => override),
  };
}
