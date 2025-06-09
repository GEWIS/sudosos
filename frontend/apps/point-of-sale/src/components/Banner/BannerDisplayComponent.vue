<template>
  <div class="absolute banner-content bottom-0 flex flex-row justify-center">
    <img :alt="banner.name" class="h-full w-full" :src="getBannerImageSrc(banner)" style="object-fit: contain" />
  </div>
</template>

<script setup lang="ts">
import { BannerResponse } from '@sudosos/sudosos-client';
import { getBannerImageSrc } from '@/utils/imageUtils';
defineProps({
  banner: {
    type: Object as () => BannerResponse,
    required: true,
  },
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
