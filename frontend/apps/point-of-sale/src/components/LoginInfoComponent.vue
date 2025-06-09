<template>
  <div
    class="h-full text-decoration-underline text-right"
    style="color: #d40000; margin-left: -60px; font-size: 35px; margin-top: 80px; margin-right: 28px"
    @click="() => (howToModalVisible = true)"
  >
    <i class="pi pi-question-circle" style="font-size: 2rem" />
  </div>

  <Dialog
    ref="howToModal"
    v-model:visible="howToModalVisible"
    :draggable="false"
    header="How do I login?"
    modal
    @show="addListenerOnDialogueOverlay(howToModal!)"
  >
    <div class="items-center flex flex-col">
      <div>
        <b style="font-weight: bold !important">User id:</b> You can use your GEWIS number as user id. <br />
        <b style="font-weight: bold !important">Pin:</b> You can (re)set your pin at https://sudosos.gewis.nl/
        <br />
      </div>
      <img alt="SudoSOS QR Code" src="@/assets/sudosos-qr.png" style="width: 25rem" />
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue';
import Dialog from 'primevue/dialog';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
const howToModalVisible: Ref<boolean> = ref<boolean>(false);
const howToModal: Ref<null | { mask: HTMLElement; close: () => void }> = ref(null);
</script>
