import { io } from 'socket.io-client';
import { useWebSocketStore } from '../stores/websocket.store';

export const setupWebSocket = () => {
  const socket = io({
    path: '/ws/socket.io',
    transports: ['websocket'], // optional: skip polling fallback
  });

  const websocketStore = useWebSocketStore();
  socket.emit('subscribe', 'system');

  socket.on('connect', () => {
    websocketStore.setConnected(true);
  });

  socket.on('disconnect', () => {
    websocketStore.setConnected(false);
  });

  socket.on('message', (message: string) => {
    websocketStore.addMessage(message);
  });

  socket.on('maintenance-mode', (enabled: boolean) => {
    websocketStore.setMaintenanceMode(enabled);
  });
};
