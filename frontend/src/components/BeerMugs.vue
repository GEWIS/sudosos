<template>
  <div id="beerMugContainer">
    <span class="beerMug"></span>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import setupBeerMugs from "@/utils/beerMugsUtil";

onMounted(() => {
  setupBeerMugs();
});
</script>

<style scoped lang="scss">
#beerMugContainer {
  position: absolute;
  left: 0;
  top: 0;
  display: none;
  z-index: -1;

  .beerMug {
    position: fixed;
    user-select: none;
    pointer-events: none;
    width: 50px;
    height: 50px;
    background-image: url("@/assets/img/bier.png");
    background-size: 100%;
  }
}
</style>
