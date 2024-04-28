<template>
  <div class="h-screen flex flex-column align-items-center">
    <TopNavbar class="flex-none" />
    <RouterView class="flex-grow-1" />
    <CopyrightBanner class="flex-none" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import CopyrightBanner from "@/components/CopyrightBanner.vue";
import TopNavbar from "@/components/TopNavbar.vue";
import "@/styles/BasePage.scss";

</script>

<style scoped>

</style>
