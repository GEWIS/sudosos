<template>
  <div class="banner-content position-absolute bottom-0 d-flex flex-row justify-content-center">
    <img style="object-fit: contain;" class="w-100 h-100" :src="getBannerImageSrc(banner)" :alt="banner.name" />
  </div>
</template>

<script setup lang="ts">
import { BannerResponse } from '@sudosos/sudosos-client';
import { getBannerImageSrc } from '@/utils/imageUtils';
defineProps({
  banner: {
    type: Object as () => BannerResponse,
    required: true
  }
});
</script>

<style scoped lang="scss">
.banner-content {
  height: 165px;
  background: url('@/assets/poster-background.png');
  margin: 1.5rem;
  width: calc(100% - 3rem);
}
</style>
