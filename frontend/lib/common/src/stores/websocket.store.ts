import { defineStore } from 'pinia';
import { Socket } from 'socket.io-client';

type LogEntry = { time: Date; message: string };

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    socket: null as Socket | null,
    connected: false,
    messages: [] as string[],
    maintenanceMode: false,
    disconnected: false,
    logs: [] as LogEntry[],
  }),
  getters: {
    getSocket(): Socket {
      if (!this.socket) {
        throw new Error('Socket not found');
      }
      return this.socket;
    },
  },
  actions: {
    setSocket(socket: Socket) {
      this.socket = socket;
    },
    setConnected(status: boolean) {
      this.connected = status;
      this.disconnected = !status;
    },
    addMessage(message: string) {
      this.messages.push(message);
    },
    setMaintenanceMode(enabled: boolean) {
      this.maintenanceMode = enabled;
    },
    addLog(log: LogEntry) {
      this.logs.push(log);
    },
  },
});
