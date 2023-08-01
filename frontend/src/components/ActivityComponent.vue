<template>
  <div v-if="activityStore.getActive">
    Automatic checkout in <b>{{ activityStore.getDuration }}</b>
    seconds
    <div
      class="fullscreen-positioning pe-none opacity-0"
      @touchstart="resetTimer"
      @click="resetTimer"
      @dragstart="disableTimer"
      @dragend="resumeTimer"
      @drag="resetTimer"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useActivityStore } from '@/stores/activity.store';

const activityStore = useActivityStore();
const resetTimer = () => {
  activityStore.resetTimer();
};
const disableTimer = () => {
  activityStore.disableTimer();
};

const resumeTimer = () => {
  activityStore.resumeTimer();
};
</script>

<style scoped lang="scss">
</style>
