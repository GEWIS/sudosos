import { defineStore } from 'pinia';

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    connected: false,
    messages: [] as string[],
    maintenanceMode: false,
    disconnected: false,
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
  },
});
