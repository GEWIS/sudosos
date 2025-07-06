import { computed } from 'vue';
import { useWebSocketStore } from '@sudosos/sudosos-frontend-common';
import { isAllowed } from '@/utils/permissionUtils';

export function useIsMaintenance() {
  const webSocketStore = useWebSocketStore();

  const override = isAllowed('override', ['all'], 'Maintenance', ['*']);

  return {
    isMaintenance: computed(() => webSocketStore.maintenanceMode),
    canOverride: computed(() => override),
  };
}
