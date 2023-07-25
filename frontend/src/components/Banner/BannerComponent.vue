/**
* This component handles the display and rotation of banners.
* It fetches banners from the store and switches to the next banner
* at a specified interval. It also updates the banner and interval
* when new banners are fetched. The interval is cleaned up when
* the component is unmounted.
*/
<template>
  <BannerDisplayComponent v-if="currentBanner" :banner="currentBanner" />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onUnmounted, ref, watch } from 'vue';
import { useBannerStore } from '@/stores/banner.store';
import BannerDisplayComponent from '@/components/Banner/BannerDisplayComponent.vue';

// Extract banners from the store
const bannerStore = useBannerStore();
bannerStore.fetchBanners();
const { activeBanners } = storeToRefs(bannerStore);

// Initialize the index and currentBanner with the first active banner
let bannerIndex = 0;
const currentBanner = ref(activeBanners.value[bannerIndex]);

// Setup banner carousel
const switchToNextBanner = () => {
  bannerIndex = (bannerIndex + 1) % activeBanners.value.length;
  currentBanner.value = activeBanners.value[bannerIndex];
};

let intervalId: number;
if (currentBanner.value) setInterval(switchToNextBanner, currentBanner.value.duration * 1000);

// If new banners are fetched we reinitialize the carousel
watch(activeBanners, (newBanners) => {
  if (newBanners.length > 0) {
    currentBanner.value = newBanners[bannerIndex];
    // Clear the existing interval and start a new one with the updated duration
    clearInterval(intervalId);
    intervalId = setInterval(switchToNextBanner, currentBanner.value.duration * 1000);
  }
});

// Cleanup the interval when the component is unmounted
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped></style>
