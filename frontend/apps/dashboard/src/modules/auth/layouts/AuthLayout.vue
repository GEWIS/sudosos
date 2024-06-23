<template>
  <div class="flex flex-column h-screen">
    <main class="flex flex-column align-items-center justify-content-center
    flex-grow text-center h-full mx-auto my-7 max-w-21rem">
      <RouterView />
    </main>
    <Footer/>
    <BeerMugs/>
  </div>
</template>

<script setup lang="ts">
import Footer from "@/components/footer/FooterBar.vue";
import BeerMugs from "@/modules/auth/components/BeerMugs.vue";
</script>

<style scoped>

</style>
