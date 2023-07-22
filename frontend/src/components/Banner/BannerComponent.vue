<template>
  <BannerDisplayComponent :banner="activeBanners[0]"/>
</template>

<script setup lang="ts">
import {useBannerStore} from "@/stores/banner.store";
import BannerDisplayComponent from "@/components/Banner/BannerDisplayComponent.vue";
import {storeToRefs} from "pinia";

const bannerStore = useBannerStore();
bannerStore.fetchBanners();

const { activeBanners } = storeToRefs(bannerStore);

</script>

<style scoped>

</style>
