<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Toast from 'primevue/toast';
import SplashComponent from '@/components/SplashComponent.vue';
import ConnectionLostOverlay from '@/components/ConnectionLostOverlay.vue';
import MaintenanceModeOverlay from '@/components/MaintenanceModeOverlay.vue';
import { playAudio, preloadAudios, Sound } from '@/utils/audioUtil';

preloadAudios([Sound.PRESS, Sound.TOP_UP_WARNING, Sound.CASHOUT]);

// Plays a sound effect when buttons or clickable elements are pressed
const handleClick = (event: Event) => {
  let element: HTMLElement | null = event.target as HTMLElement;
  while (element) {
    const hasClickListener =
      element.onclick !== null ||
      element.tagName.toLowerCase() === 'button' ||
      // @ts-expect-error - Vue adds __vnode property with event listeners
      element.__vnode?.props?.onClick;

    if (hasClickListener) {
      playAudio(Sound.PRESS, 0.6);
      break;
    }

    element = element.parentElement;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClick, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClick, true);
});
</script>

<template>
  <Toast />
  <MaintenanceModeOverlay />
  <ConnectionLostOverlay />
  <RouterView />
  <SplashComponent />
</template>

<style lang="scss"></style>
