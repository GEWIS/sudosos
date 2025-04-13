<template>
  <div class="scanners" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, PropType } from 'vue';

const props = defineProps({
  handleNfcLogin: {
    type: Function as PropType<(nfcCode: string) => Promise<void>>,
    required: true,
  },
  handleEanLogin: {
    type: Function as PropType<(eanCode: string) => Promise<void>>,
    required: true,
  },
});

let captures: KeyboardEvent[] = [];

/**
 * Handle the input event. When the enter key is pressed, the captured
 * key events are reduced to a string and passed to the handleLogin
 * functions. The captures are then reset.
 */
const onInput = (event: KeyboardEvent): void => {
  if (event.code === 'Enter') {
    const capturedCode = captures.reduce((input, e) => input + e.key, '');
    const checkCode = capturedCode.substring(0, 3);
    switch (checkCode) {
      case 'nfc':
        void props.handleNfcLogin(capturedCode.substring(3));
        break;
      case 'ean':
        // capturedCode.substring(3)
        break;
      default:
      //TODO toast error for user
    }
    captures = [];
  } else {
    captures.push(event);
  }
};

onMounted(() => {
  document.addEventListener('keydown', onInput);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onInput);
});
</script>

<style scoped lang="scss"></style>
