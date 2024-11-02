<template>
  <div class="scanners" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, PropType } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const props = defineProps({
  handleNfcUpdate: {
    type: Function as PropType<(nfcCode: string) => Promise<void>>,
    required: true
  }
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
          props.handleNfcUpdate(capturedCode.substring(3)).then(() => {
            toast.add({ severity: 'success', summary: 'NFC code accepted',
              detail: 'Your NFC code has been accepted.' });
          }).catch((err) => {
            console.error(err);
            toast.add({ severity: 'error', summary: 'NFC code not accepted',
              detail: 'Your NFC code could not be accepted. Please try again.' });
          });
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

<style scoped lang="scss">

</style>
