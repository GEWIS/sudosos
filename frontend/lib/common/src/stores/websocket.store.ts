import { defineStore } from 'pinia';

type LogEntry = { time: Date; message: string };

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    connected: false,
    messages: [] as string[],
    maintenanceMode: false,
    disconnected: false,
    logs: [] as LogEntry[],
  }),
  actions: {
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
