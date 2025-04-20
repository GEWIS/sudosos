import { onUnmounted, watch } from 'vue';
import { useWebSocketStore } from '../stores/websocket.store';

export function useWebSocketConnectionWatcher(onDisconnect?: () => void, onReconnect?: () => void) {
  const wsStore = useWebSocketStore();

  let prevConnected = wsStore.connected;

  const stop = watch(
    () => wsStore.connected,
    (connected) => {
      if (!connected && prevConnected) {
        onDisconnect?.();
      } else if (connected && !prevConnected) {
        onReconnect?.();
      }
      prevConnected = connected;
    },
    { immediate: true },
  );

  onUnmounted(() => stop());
}
