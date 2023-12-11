<template>
  <TopNavbar />
  <RouterView />
  <CopyrightBanner />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import CopyrightBanner from "@/components/CopyrightBanner.vue";
import TopNavbar from "@/components/TopNavbar.vue";
</script>

<style scoped>

</style>
