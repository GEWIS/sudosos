<script setup lang="ts">
import Toast from 'primevue/toast';
</script>

<template>
  <Toast />
  <RouterView/>
  <img class="image-underlay" src="@/assets/splash.svg" alt="Overlay Image" />
</template>

<style lang="scss">
.image-underlay {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  pointer-events: none;
  z-index: -10;
  overflow: hidden;

  position: fixed;
  top: -25%;
  right: 0;
  height: 175%;
}
</style>
