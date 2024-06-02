// activityStore.js
import { defineStore } from 'pinia';
import { useCartStore } from "@/stores/cart.store";
import { logoutService } from "@/services/logoutService";
import { useSettingStore } from "@/stores/settings.store";

interface ActivityState {
  duration: number
  isActive: boolean
}

let timerId: null | number = null;
const TIME_OUT = 30;

export const useActivityStore = defineStore('activity', {
  state: (): ActivityState => ({
    duration: TIME_OUT,
    isActive: false
  }),
  getters: {
    getDuration(): number {
      return this.duration;
    },
    getActive(): boolean {
      return this.isActive;
    }
  },
  actions: {
    startTimer() {
      this.isActive = true;
      if (timerId) clearInterval(timerId); // Clear previous timer
      timerId = setInterval(() => {
        this.duration -= 1;

        if (this.duration <= 0) {
          this.stopTimer();
          this.onTimerEnd();
        }
      }, 1000); // Timer tick every 1 second
    },

    stopTimer() {
      this.isActive = false;
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    },

    resumeTimer() {
      if (!this.isActive && this.duration > 0) {
        this.isActive = true;
        timerId = setInterval(() => {
          this.duration -= 1;

          if (this.duration <= 0) {
            this.stopTimer();
            this.onTimerEnd();
          }
        }, 1000);
      }
    },

    resetTimer() {
      this.duration = TIME_OUT;
    },

    restartTimer() {
      this.stopTimer();
      this.duration = TIME_OUT; // Reset the duration to the initial value
      this.startTimer();
    },

    disableTimer() {
      this.stopTimer();
      this.duration = 0;
      this.isActive = false;
    },

    async onTimerEnd() {
      const cartStore = useCartStore();
      if (useSettingStore().isBorrelmode) return;
      if (cartStore.cartTotalCount > 0 ) await useCartStore().checkout();
      await logoutService();
    }
  }
});
