<template>
  <div v-if="activityStore.getActive">
    Automatic checkout in <b class="font-bold">{{ activityStore.getDuration }}</b> seconds
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useActivityStore } from '@/stores/activity.store';

const activityStore = useActivityStore();

const resetTimer = () => {
  activityStore.resetTimer();
};

const addEventListeners = () => {
  window.addEventListener('touchstart', resetTimer);
  window.addEventListener('touchmove', resetTimer);
  window.addEventListener('touchend', resetTimer);
  window.addEventListener('mousedown', resetTimer);
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('mouseup', resetTimer);
  window.addEventListener('keydown', resetTimer);
  window.addEventListener('input', resetTimer);
};

const removeEventListeners = () => {
  window.removeEventListener('touchstart', resetTimer);
  window.removeEventListener('touchmove', resetTimer);
  window.removeEventListener('touchend', resetTimer);
  window.removeEventListener('mousedown', resetTimer);
  window.removeEventListener('mousemove', resetTimer);
  window.removeEventListener('mouseup', resetTimer);
  window.removeEventListener('keydown', resetTimer);
  window.removeEventListener('input', resetTimer);
};

onMounted(addEventListeners);
onUnmounted(removeEventListeners);
</script>
