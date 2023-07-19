<template>
  <TopNavbar />
  <RouterView />
  <CopyrightBanner />
</template>

<script setup>
import {RouterView} from "vue-router";
import CopyrightBanner from "@/components/CopyrightBanner.vue";
import TopNavbar from "@/components/TopNavbar.vue";
</script>

<style scoped>

</style>
