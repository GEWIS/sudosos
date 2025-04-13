<template>
  <div class="nfc-search" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, PropType } from 'vue';
import { UserResponse } from '@sudosos/sudosos-client';

const props = defineProps({
  handleNfcSearch: {
    type: Function as PropType<(nfcCode: string) => Promise<UserResponse>>,
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
    void props.handleNfcSearch(capturedCode.substring(3));
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
