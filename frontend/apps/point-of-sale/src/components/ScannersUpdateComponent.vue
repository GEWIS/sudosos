<template>
  <div class="m-5 cursor-pointer" @click="() => (nfcModalVisible = true)">
    <div class="pi pi-id-card" style="font-size: 3rem" />
  </div>
  <Dialog
    ref="nfcModal"
    v-model:visible="nfcModalVisible"
    header="Manage NFC"
    modal
    :pt="{
      header: () => ({ class: ['dialog-header'] }),
      closeButton: () => ({ class: ['dialog-close'] }),
    }"
    :style="{ width: '30vw', class: ['container'] }"
    @show="addListenerOnDialogueOverlay(nfcModal!)"
  >
    <div class="items-center flex flex-col">
      <div id="scanners" class="scanners" />
      <ProgressSpinner
        animation-duration="1s"
        class="mb-4"
        fill="transparent"
        stroke-width="6"
        style="width: 75px; height: 75px"
        :style="{ display: 'flex' }"
      />
      <b class="bold">Scan your NFC card now!</b><br />
      <span class="text-sm text-center">Note: Banking cards, ID cards and phones will not work</span><br />
      <Button class="font-medium px-2 py-1 mt-1 text-base" @click="deleteNfc"> Remove linked NFC </Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { PropType, Ref, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';

const toast = useToast();
const nfcModalVisible: Ref<boolean> = ref<boolean>(false);
const nfcModal: Ref<{ mask: HTMLElement; close: () => void } | null> = ref(null);

const props = defineProps({
  handleNfcUpdate: {
    type: Function as PropType<(nfcCode: string) => Promise<void>>,
    required: true,
  },
  handleNfcDelete: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },
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
        props
          .handleNfcUpdate(capturedCode.substring(3))
          .then(() => {
            toast.add({
              severity: 'success',
              summary: 'NFC code added!',
              detail: 'You can now login to the POS by using the scanned NFC card.',
              life: 5000,
            });
          })
          .catch((err) => {
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

const deleteNfc = async () => {
  await props
    .handleNfcDelete()
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'NFC code removed!',
        detail: 'The linked NFC code has been removed.',
        life: 5000,
      });
    })
    .catch((err) => {
      console.error(err);
      toast.add({
        severity: 'error',
        summary: 'API error',
        detail: err.message,
        life: 5000,
      });
    })
    .finally(() => {
      nfcModalVisible.value = false;
    });
};
</script>

<style scoped lang="scss">
.dialog-header {
  background: var(--accent-color) !important;
  color: white !important;
}

.dialog-close {
  color: white !important;
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
