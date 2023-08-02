// setting.js (SettingStore module)
import { defineStore } from 'pinia';
import { usePointOfSaleStore } from "@/stores/pos.store";

export const useSettingStore = defineStore('setting', {
  state: () => ({
  }),
  getters: {
    isAuthenticatedPos() {
      const posStore = usePointOfSaleStore();
      if (!posStore.getPos) return true;
      return posStore.getPos.useAuthentication;
    },
    checkoutCountdown() {
      return this.isAuthenticatedPos;
    },
    isBorrelmode() {
      return !this.isAuthenticatedPos;
    }
  },
  actions: {
  },
});
