<template>
  <div
    v-if="disconnected"
    class="fixed top-0 left-0 w-screen h-screen overlay flex align-items-center justify-content-center z-5"
  >
    <div class="flex flex-col align-items-center gap-3 opacity-100">
      <div class="text-3xl font-bold text-center">Oh no! Lost connection! Please stand by...</div>
      <ProgressSpinner stroke-width="4" style="width: 50px; height: 50px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';
import { useAuthStore, useWebSocketConnectionWatcher } from '@sudosos/sudosos-frontend-common';
import { logoutService } from '@/services/logoutService';
import apiService from '@/services/ApiService';

const disconnected = ref(false);
useWebSocketConnectionWatcher(
  () => {
    disconnected.value = true;
  },
  () => {
    disconnected.value = false;
    const authStore = useAuthStore();
    // Try and refresh the token to see if it's still valid
    authStore.refreshToken(apiService).catch(async (e) => {
      console.warn('Could not refresh token on reconnect', e);
      // Token has expired, log the user out
      await logoutService();
    });
  },
);
</script>

<style scoped lang="scss">
.overlay {
  background: rgba(177, 177, 177, 0.8);
}
</style>
