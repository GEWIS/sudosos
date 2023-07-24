<template>
  <div v-if="activityStore.getActive"> Automatic checkout in <b>{{ activityStore.getDuration }}</b>
    seconds
    <div class="activity-overlay" @touchstart="resetTimer" @click="resetTimer"
         @dragstart="disableTimer" @dragend="resumeTimer"
         @drag="resetTimer"></div>
  </div>
</template>

<script setup lang="ts">
import { useActivityStore } from "@/stores/activity.store";

const activityStore = useActivityStore();
const resetTimer = () => {
  activityStore.resetTimer();
}
const disableTimer = () => {
  activityStore.disableTimer();
}

const resumeTimer = () => {
  activityStore.resumeTimer();
}
</script>

<style scoped>
.activity-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
}
</style>
