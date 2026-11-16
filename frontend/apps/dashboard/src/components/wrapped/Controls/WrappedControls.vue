<template>
  <div class="flex justify-between items-center">
    <button
      v-for="arrow in arrows"
      :key="arrow.event"
      :aria-label="arrow.label"
      class="w-10 h-10 rounded-full flex items-center justify-center bg-white/95 text-gray-800 hover:bg-white shadow-lg ring-1 ring-black/10 cursor-pointer"
      :class="{ invisible: currentIndex === arrow.hiddenAt }"
      type="button"
      @click="emit(arrow.event)"
    >
      <i aria-hidden="true" class="pi" :class="arrow.icon"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ currentIndex: number; totalCards: number }>();

const emit = defineEmits<{ (e: 'prev' | 'next'): void }>();

const arrows = computed(() => [
  { event: 'prev' as const, label: 'Previous card', icon: 'pi-arrow-left', hiddenAt: 0 },
  { event: 'next' as const, label: 'Next card', icon: 'pi-arrow-right', hiddenAt: props.totalCards - 1 },
]);
</script>
