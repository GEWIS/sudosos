<template>
  <div :aria-valuemax="count" aria-valuemin="1" :aria-valuenow="current + 1" class="flex gap-1" role="progressbar">
    <div v-for="index in count" :key="index" class="segment">
      <div v-if="index - 1 < current" class="fill"></div>
      <div
        v-else-if="index - 1 === current"
        :key="`${current}-${duration}`"
        class="fill"
        :class="{ timed: duration > 0, paused }"
        :style="{ animationDuration: `${duration}ms` }"
        @animationend="emit('complete')"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
  current: number;
  /** Time in milliseconds after which the current segment is complete, or 0 to never complete. */
  duration: number;
  paused: boolean;
}>();

const emit = defineEmits<{ (e: 'complete'): void }>();
</script>

<style scoped>
.segment {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  overflow: hidden;
  background: color-mix(in srgb, currentColor 30%, transparent);
}

.fill {
  height: 100%;
  background: currentColor;
  transform-origin: left;
}

.fill.timed {
  animation: fill linear forwards;
}

.fill.paused {
  animation-play-state: paused;
}

@keyframes fill {
  from {
    transform: scaleX(0);
  }
}
</style>
