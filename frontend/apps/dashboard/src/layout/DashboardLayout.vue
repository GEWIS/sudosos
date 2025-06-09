<template>
  <div class="items-center flex flex-col h-screen">
    <TopNavbar class="flex-none" />
    <RouterView class="flex-grow-1" />
    <Footer class="flex-none" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import Footer from '@/components/footer/FooterBar.vue';
import TopNavbar from '@/components/TopNavbar.vue';
import '@/styles/BasePage.scss';
</script>

<style scoped></style>
