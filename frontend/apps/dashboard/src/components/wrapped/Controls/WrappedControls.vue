<template>
  <div class="controls mt-auto">
    <div v-if="props.showArrows" class="flex justify-between items-center">
      <div class="min-w-10">
        <button
          v-show="props.currentIndex !== 0"
          aria-label="Previous card"
          class="w-10 h-10 rounded-full flex items-center justify-center bg-white/95 text-gray-800 hover:bg-white shadow-lg ring-1 ring-black/10 backdrop-blur-sm relative z-20"
          @click="emitPrev"
        >
          <i aria-hidden="true" class="pi pi-arrow-left"></i>
        </button>
      </div>

      <DotPager :current-index="props.currentIndex" :max-visible="5" :total-cards="props.totalCards" @go="onGo" />

      <div class="min-w-10">
        <button
          v-show="props.currentIndex !== props.totalCards - 1"
          aria-label="Next card"
          class="w-10 h-10 rounded-full flex items-center justify-center bg-white/95 text-gray-800 hover:bg-white shadow-lg ring-1 ring-black/10 backdrop-blur-sm relative z-20"
          @click="emitNext"
        >
          <i aria-hidden="true" class="pi pi-arrow-right"></i>
        </button>
      </div>
    </div>

    <div v-else class="flex justify-center gap-2">
      <DotPager :current-index="props.currentIndex" :max-visible="5" :total-cards="props.totalCards" @go="onGo" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DotPager from '@/components/wrapped/Controls/DotPager.vue';

const props = defineProps({
  showArrows: { type: Boolean, required: true },
  currentIndex: { type: Number, required: true },
  totalCards: { type: Number, required: true },
});

const emit = defineEmits<{
  (e: 'go', i: number): void;
  (e: 'prev'): void;
  (e: 'next'): void;
}>();

function onGo(i: number) {
  emit('go', i);
}
function emitPrev() {
  emit('prev');
}
function emitNext() {
  emit('next');
}
</script>
