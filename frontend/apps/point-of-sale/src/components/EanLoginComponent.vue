<template>
  <div class="ean-scanner" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, PropType } from "vue";

const props = defineProps({
  handleLogin: {
    type: Function as PropType<(eanCode: string) => Promise<void>>,
    required: true
  }
});

let captures: KeyboardEvent[] = [];

/**
 * Handle the input event. When the enter key is pressed, the captured
 * key events are reduced to a string and passed to the handleLogin
 * function. The captures are then reset.
 */
const onInput = (event: KeyboardEvent): void => {
    if (event.code === 'Enter') {
    const code = captures.reduce((input, e) => input + e.key, '');
    props.handleLogin(code);
    captures = [];
  } else {
    captures.push(event);
  }
};

onMounted(() => {
  document.addEventListener('keydown', onInput);
});

onUnmounted(() => {
  document.addEventListener('keydown', onInput);
});
</script>

<style scoped lang="scss">

</style>
