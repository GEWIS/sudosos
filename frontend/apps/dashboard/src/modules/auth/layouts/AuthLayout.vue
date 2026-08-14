<template>
  <MaintenanceModeOverlay />
  <div class="flex flex-col h-screen">
    <main class="items-center flex flex-col flex-grow h-full justify-center max-w-21rem mx-auto my-7 text-center">
      <RouterView />
    </main>
    <Footer />
    <BeerMugs />
  </div>
</template>

<script setup lang="ts">
import Footer from '@/components/footer/FooterBar.vue';
import BeerMugs from '@/modules/auth/components/BeerMugs.vue';
import MaintenanceModeOverlay from '@/components/MaintenanceModeOverlay.vue';
</script>

<style scoped></style>
