<template>
  <div class="banner-content rounded-bottom-5 position-absolute bottom-0 w-100">
    <img class="w-100 h-100 rounded-bottom-5" :src="getBannerImageSrc(banner)" :alt="banner.name" />
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
  background-color: rgba(141, 141, 141, 0.53);
}
</style>
