<script setup lang="ts">
import Toast from 'primevue/toast';
import SplashComponent from '@/components/SplashComponent.vue';
import ConnectionLostOverlay from '@/components/ConnectionLostOverlay.vue';
import MaintenanceModeOverlay from '@/components/MaintenanceModeOverlay.vue';
import NoPosTokenOverlay from '@/components/NoPosTokenOverlay.vue';
</script>

<template>
  <Toast />
  <MaintenanceModeOverlay />
  <NoPosTokenOverlay />
  <ConnectionLostOverlay />
  <RouterView />
  <SplashComponent />
</template>

<style lang="scss"></style>
