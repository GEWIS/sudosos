import { io } from 'socket.io-client';
import { useWebSocketStore } from '../stores/websocket.store';

export interface WebSocketSetupOptions {
  /** Static token used for the initial connection. Prefer `getToken` for sessions where the token may be refreshed. */
  token?: string | null;
  /** Callback invoked before every connect/reconnect attempt to supply the latest token. Takes precedence over `token`. */
  getToken?: () => string | null | undefined;
}

export const setupWebSocket = (options?: WebSocketSetupOptions) => {
  const getToken = options?.getToken ?? (options?.token ? () => options.token : undefined);

  const socket = io({
    path: '/ws/socket.io',
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    // Use a callback so socket.io fetches the latest token on every
    // connect/reconnect attempt instead of reusing a stale credential.
    ...(getToken
      ? {
          auth: (cb: (data: object) => void) => {
            const token = getToken();
            cb(token ? { token } : {});
          },
        }
      : {}),
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

  socket.on('connect', () => {
    websocketStore.setConnected(true);
    // Re-subscribe to system channel on every connect/reconnect
    socket.emit('subscribe', 'system');
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
