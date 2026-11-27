<template>
  <div>
    <div class="flex items-end gap-px h-16" :class="{ revealed }">
      <div
        v-for="(value, index) in values"
        :key="index"
        class="bar flex-1 rounded-t-sm"
        :class="index === peak ? 'bg-white' : 'bg-white/40'"
        :style="{ height: `${(value / values[peak]) * 100}%`, transitionDelay: `${index * 30}ms` }"
      ></div>
    </div>
    <div class="flex gap-px text-[0.6rem] pt-1">
      <span v-for="(label, index) in labels" :key="index" class="flex-1 text-center">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ values: number[]; labels: string[]; revealed: boolean }>();

const peak = computed(() => props.values.indexOf(Math.max(...props.values)));
</script>

<style scoped>
.bar {
  min-height: 2px;
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 400ms ease;
}

.revealed .bar {
  transform: scaleY(1);
}
</style>
