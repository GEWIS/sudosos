<template>
  <div class="flex flex-column h-screen">
    <main
      class="align-items-center flex flex-column flex-grow h-full justify-content-center max-w-21rem mx-auto my-7 text-center"
    >
      <RouterView />
    </main>
    <Footer />
    <BeerMugs />
  </div>
</template>

<script setup lang="ts">
import Footer from '@/components/footer/FooterBar.vue';
import BeerMugs from '@/modules/auth/components/BeerMugs.vue';
</script>

<style scoped></style>
