<template>
  <div class="nfc-icon"
       @click="() => nfcModalVisible = true">
    <div class="pi pi-id-card text-6xl"/>
  </div>
  <Dialog v-model:visible="nfcModalVisible" ref="nfcModal" modal header="Link NFC"
          :style="{ width: '30vw', class: ['container'] }"
          @show="addListenerOnDialogueOverlay(nfcModal)"
          :pt="{
            header: () => ({class: ['dialog-header']}),
            closeButton: () => ({class: ['dialog-close']})}" >

    <div class="flex flex-column align-items-center">
      <div class="scanners" id="scanners"/>
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="6" fill="transparent"
                               animationDuration="1s" :style="{ display : 'flex' }"/>
      <b style="font-weight: bold!important;">Scan your NFC card now!</b><br>
      <b>Note: Banking cards, ID cards and phones will not work</b><br>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { useToast } from "primevue/usetoast";
import { Ref, ref, watch } from 'vue';
import { addListenerOnDialogueOverlay } from "@sudosos/sudosos-frontend-common";

const toast = useToast();
const nfcModalVisible: Ref<boolean> = ref < boolean > (false);
const nfcModal: Ref<null | any> = ref(null);

const props = defineProps({
  handleNfcUpdate: {
    type: Function as PropType<(nfcCode: string) => Promise<void>>,
    required: true
  }
});

watch(nfcModalVisible, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', onInput);
  } else {
    document.removeEventListener('keydown', onInput);
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
            toast.add({
              severity: "success",
              summary: "NFC code added!",
              detail: "You can now login to the POS by using the scanned NFC card.",
              life: 5000,
            });
          }).catch((err) => {
            console.error(err);
            toast.add({
              severity: 'error',
              summary: 'NFC code not added.',
              detail: 'Something went wrong, please try again.',
              life: 5000,
            });
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
</script>

<style scoped lang="scss">
.dialog-header {
  background: var(--accent-color)!important;
  color: white!important;
}

.dialog-close {
  color: white!important;
}
.nfc-icon {
  height: 100px;
  position: fixed;
  left: 120px;
  font-size: 70px;
  cursor: pointer;
  bottom: 0;
  color: var(--accent-color);
}
</style>
