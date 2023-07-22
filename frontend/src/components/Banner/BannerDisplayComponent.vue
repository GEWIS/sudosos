<template>
  <div class="banner-content">
    <img class="banner-image" :src="getBannerImageSrc(banner)" v-if="banner" :alt="banner.name"/>
  </div>
</template>

<script setup lang="ts">
import {BannerResponse} from "@sudosos/sudosos-client";
import {getBannerImageSrc} from "@/utils/imageUtils";

const props = defineProps({
  banner: {
    type: Object as () => BannerResponse,
    required: true,
  }
})
</script>

<style scoped>

.banner-image {
  width: 100%;
  height: 100%;
  border-bottom-left-radius: 25px;
  border-bottom-right-radius: 25px;
}

.banner-content {
  height: 165px;
  width: 100%;
  position: absolute;
  bottom: 0;
  background-color: rgba(141, 141, 141, 0.53);
  border-bottom-left-radius: 25px;
  border-bottom-right-radius: 25px;
}
</style>
