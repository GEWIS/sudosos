<template>
  <BannerDisplayComponent v-if="currentBanner" :banner="currentBanner"/>
</template>

<script setup lang="ts">
import {useBannerStore} from "@/stores/banner.store";
import BannerDisplayComponent from "@/components/Banner/BannerDisplayComponent.vue";
import {storeToRefs} from "pinia";
import {onUnmounted, ref, watch} from "vue";

const bannerStore = useBannerStore();
bannerStore.fetchBanners();

const { activeBanners } = storeToRefs(bannerStore);

// Initialize the index and currentBanner with the first active banner
let bannerIndex = 0;
let currentBanner = ref(activeBanners.value[bannerIndex]);

const switchToNextBanner = () => {
  bannerIndex = (bannerIndex + 1) % activeBanners.value.length;
  currentBanner.value = activeBanners.value[bannerIndex];
};

let intervalId: number;
if (currentBanner.value) setInterval(switchToNextBanner, currentBanner.value.duration * 1000);

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

<style scoped>

</style>
