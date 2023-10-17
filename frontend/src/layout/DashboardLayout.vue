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
import { computed, onMounted } from "vue";
import { isAuthenticated, useAuthStore } from "@sudosos/sudosos-frontend-common";

const renderComponent = computed(() => {
  return router.currentRoute.value.name !== 'tos';
});

const authStore = useAuthStore();

onMounted(async () => {
  if(isAuthenticated && authStore.getUser.acceptedToS == 'NOT_ACCEPTED') {
    toToSView();
  }
});

const toToSView = () => {
  router.push({ name: 'tos' });
};

</script>

<style scoped>

</style>
