// setting.js (SettingStore module)
import { defineStore } from 'pinia';
import { usePointOfSaleStore } from '@/stores/pos.store';

export const useSettingStore = defineStore('setting', {
  state: () => ({
    alcoholTimeToday: Date.now() + 24 * 60 * 60 * 1000, // Should always be recalculated
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
    },
    isAlcoholTime(): boolean {
      return Date.now() >= this.alcoholTimeToday;
    },
    getTargetCategory(): string {
      if (this.isBorrelmode) {
        return 'alcoholic';
      } else {
        return this.isAlcoholTime ? 'alcoholic' : 'non-alcoholic';
      }
    },
    showTimers(): boolean {
      // Only show timers in production mode
      return import.meta.env.DEV && this.isAuthenticatedPos;
    },
  },
  actions: {
    /**
     * Fetches the time of the current that the alcohol time will start.
     * e.g. on 2024-09-12 this will be 2024-09-12T16:30:00.000Z.
     * Assumes you are on the GEWIS network, because sudopos.gewis.nl is only accessible from the GEWIS network.
     *
     * This needs to be properly implemented with Aurora when this is done.
     */
    async fetchAlcoholTimeToday(): Promise<number> {
      const date = new Date().toISOString().split('T')[0];
      const alcTimeRes = await fetch('https://infoscherm.gewis.nl/backoffice/api.php?query=alcoholtijd');

      // Default alcohol time is 16:30
      let alcTime = '16:30';

      if (alcTimeRes.ok) {
        const alcTimeResText = await alcTimeRes.text();

        // If time matches XX:XX regex
        if (alcTimeResText.match(/^[0-2]?[0-9]:[0-6][0-9]$/)) {
          alcTime = alcTimeResText;
        }
      }

      // This code only works for timezones that are whole hours apart from UTC.
      // Do not deploy SudoSOS POS in some parts of India, Australia and other countries.
      const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
      this.alcoholTimeToday = Date.parse(`${date}T${alcTime}:00.000Z`) + timezoneOffset;
      return this.alcoholTimeToday;
    },
  },
});
