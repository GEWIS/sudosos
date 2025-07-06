<template>
  <MaintenanceModeOverlay />
  <div class="items-center flex flex-col h-screen">
    <TopNavbar class="flex-none" />
    <RouterView class="flex-grow-1" />
    <Footer class="flex-none" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import Footer from '@/components/footer/FooterBar.vue';
import TopNavbar from '@/components/NavbarTop.vue';
import MaintenanceModeOverlay from '@/components/MaintenanceModeOverlay.vue';
</script>

<style scoped></style>
