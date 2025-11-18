import { io } from 'socket.io-client';
import { useWebSocketStore } from '../stores/websocket.store';

export const setupWebSocket = () => {
  const socket = io({
    path: '/ws/socket.io',
    transports: ['websocket'],
  });

  const websocketStore = useWebSocketStore();
  websocketStore.setSocket(socket);
  const addToLogs = (event: string, args: unknown[]) => {
    const logTime = new Date();
    const logMsg = `[${event}] ${args.map((a) => JSON.stringify(a)).join(' ')}`;
    websocketStore.addLog({ time: logTime, message: logMsg });
  };

  socket.onAny((event, ...args) => {
    addToLogs(event, args);
  });

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
