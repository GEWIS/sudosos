<template>
  <BannerDisplayComponent :banner="activeBanners[0]"/>
</template>

<script setup lang="ts">
import {useBannerStore} from "@/stores/banner.store";
import BannerDisplayComponent from "@/components/Banner/BannerDisplayComponent.vue";
import {storeToRefs} from "pinia";
import {onUnmounted, watch} from "vue";

const bannerStore = useBannerStore();
bannerStore.fetchBanners();

const { activeBanners } = storeToRefs(bannerStore);

// Initialize the index and currentBanner with the first active banner
let bannerIndex = 0;
let currentBanner = activeBanners.value[bannerIndex];

// Function to switch to the next banner
const switchToNextBanner = () => {
  bannerIndex = (bannerIndex + 1) % activeBanners.value.length;
  currentBanner = activeBanners.value[bannerIndex];
};

let intervalId: number;
if (currentBanner) setInterval(switchToNextBanner, currentBanner.duration * 1000);

watch(activeBanners, (newBanners) => {
  if (newBanners.length > 0) {
    currentBanner = newBanners[bannerIndex];
    // Clear the existing interval and start a new one with the updated duration
    clearInterval(intervalId);
    intervalId = setInterval(switchToNextBanner, currentBanner.duration * 1000);
  }
});


// Cleanup the interval when the component is unmounted
onUnmounted(() => {
  clearInterval(intervalId);
});

</script>

<style scoped>

</style>
