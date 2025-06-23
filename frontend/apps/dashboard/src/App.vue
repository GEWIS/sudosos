<script setup lang="ts">
import { RouterView } from 'vue-router';
import Toast from 'primevue/toast';
import { useDarkMode } from '@/composables/darkMode';
useDarkMode();
</script>

<template>
  <Toast />
  <RouterView />
</template>
