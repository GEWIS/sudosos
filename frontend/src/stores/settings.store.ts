// setting.js (SettingStore module)
import { defineStore } from 'pinia';
import { usePointOfSaleStore } from "@/stores/pos.store";

export const useSettingStore = defineStore('setting', {
  state: () => ({
  }),
  getters: {
    isAuthenticatedPos(): boolean {
      const posStore = usePointOfSaleStore();
      if (!posStore.getPos) return true;
      return posStore.getPos.useAuthentication;
    },
    checkoutCountdown(): boolean {
      return this.isAuthenticatedPos;
    },
    isBorrelmode(): boolean {
      return !this.isAuthenticatedPos;
    },
    showUsersRecentTransactions(): boolean {
      return this.isAuthenticatedPos;
    },
    showAddToCartAnimation(): boolean {
      return this.isAuthenticatedPos;
   }
  },
  actions: {
  },
});
