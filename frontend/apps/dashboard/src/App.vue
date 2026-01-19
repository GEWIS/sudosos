<script setup lang="ts">
import { RouterView } from 'vue-router';
import Toast from 'primevue/toast';
import { useDarkMode } from '@/composables/darkMode';
import { useBetaSync } from '@/composables/useBetaSync';
import BetaSyncOverlay from '@/components/BetaSyncOverlay.vue';

useDarkMode();

const { showRedirectOverlay } = useBetaSync();
</script>

<template>
  <Toast />
  <BetaSyncOverlay :visible="showRedirectOverlay" />
  <RouterView />
</template>
