<template>
  <div
    v-if="maintenanceMode"
    class="fixed top-0 left-0 w-screen h-screen bg-red flex align-items-center justify-content-center z-5"
  >
    <main
      class="align-items-center flex flex-column flex-grow h-full justify-content-center max-w-30rem mx-auto my-7 text-center"
    >
      <img alt="logo" class="block max-h-9rem mb-5 mx-auto" src="../assets/bier_grayscale.png" />
      <div class="font-bold text-3xl text-center text-white">SudoSOS is under maintenance.</div>
      <div class="text-2xl text-center text-white">Please try again later...</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useWebSocketStore } from '@sudosos/sudosos-frontend-common';
import { computed, watch } from 'vue';
import { logoutService } from '@/services/logoutService';

const webSocketStore = useWebSocketStore();
const maintenanceMode = computed(() => webSocketStore.maintenanceMode);
watch(maintenanceMode, async () => {
  // Force logout when the maintenance mode is enabled
  if (maintenanceMode.value) {
    await logoutService();
  }
});
</script>

<style scoped lang="scss">
.bg-red {
  background: var(--accent-color, #d40100);
}
</style>
