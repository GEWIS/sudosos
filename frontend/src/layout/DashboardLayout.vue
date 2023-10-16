<template>
  <TopNavbar v-if="renderComponent"/>
  <RouterView />
  <CopyrightBanner v-if="renderComponent"/>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import CopyrightBanner from "@/components/CopyrightBanner.vue";
import TopNavbar from "@/components/TopNavbar.vue";
import router from "@/router";
import { computed } from "vue";

const renderComponent = computed(() => {
  return router.currentRoute.value.name !== 'tos';
});

</script>

<style scoped>

</style>
