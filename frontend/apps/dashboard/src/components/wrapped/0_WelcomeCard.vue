<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root" :class="{ active }">
    <div class="bg bier-bg"></div>

    <div class="content text-white">
      <h1 class="welcome text-4xl">
        Hello <span class="font-bold">{{ firstName }}</span
        >!
      </h1>
      <h3 class="text-xl pt-4">Welcome to your</h3>
      <h1 class="text-3xl font-bold">SudoSOS Wrapped!</h1>
    </div>

    <div
      v-if="!showArrows"
      class="swipe-hint text-white flex flex-row align-middle fixed right-4 bottom-4 gap-2 items-center pointer-none:"
    >
      <p class="m-0">Swipe left to get started</p>
      <i class="pi pi-arrow-right"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRef } from 'vue';
const props = defineProps<{ active?: boolean; firstName?: string; showArrows?: boolean }>();
const active = toRef(props, 'active');
const firstName = toRef(props, 'firstName');
const showArrows = toRef(props, 'showArrows');
</script>

<style scoped>
.bier-bg {
  background-image: url('../../assets/img/bier.png');
  background-size: 90%;
  opacity: 0.4;
  transform: translate(-5%, 0) rotate(-12deg);
}
</style>
