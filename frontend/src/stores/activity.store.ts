// activityStore.js
import { defineStore } from 'pinia';

interface ActivityState {
  timer: number | null,
  duration: number,
  isActive: boolean,
}

const TIME_OUT = 30;
export const useActivityStore = defineStore('activity', {
  state: (): ActivityState => ({
    timer: null,
    duration: TIME_OUT,
    isActive: false,
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
      this.timer = setInterval(() => {
        this.duration -= 1;

        if (this.duration <= 0) {
          this.stopTimer();
          this.onTimerEnd();
        }
      }, 1000); // Timer tick every 1 second
    },

    stopTimer() {
      this.isActive = false;
      if (this.timer) clearInterval(this.timer);
    },

    resumeTimer() {
      if (!this.isActive && this.duration > 0) {
        this.isActive = true;
        this.timer = setInterval(() => {
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

    onTimerEnd() {
      console.log('Timer went off. User is no longer present at the POS.');
      // Emit any function or perform any necessary action when the timer goes off.
    },
  },
});
