<template>
  <div class="flex flex-column h-screen">
    <main class="flex flex-column align-items-center justify-content-center
    flex-grow text-center h-full mx-auto my-7 max-w-21rem">
      <RouterView />
    </main>
    <CopyrightBanner/>
    <BeerMugs/>
  </div>
</template>

<script setup lang="ts">
import CopyrightBanner from "@/components/CopyrightBanner.vue";
import BeerMugs from "@/components/BeerMugs.vue";
</script>

<style scoped>

</style>
