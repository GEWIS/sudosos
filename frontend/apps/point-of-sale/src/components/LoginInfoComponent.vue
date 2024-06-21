<template>
    <div class="text-decoration-underline text-right h-full"
        style="color: #d40000; margin-left: -60px; font-size: 35px; margin-top: 80px; margin-right: 25px;"
        @click="() => howToModalVisible = true">
      <i class="pi pi-question-circle text-4xl"/>
    </div>

    <Dialog v-model:visible="howToModalVisible" header="How do I login?" modal :draggable="false" ref="howToModal"
        @show="addListenerOnDialogueOverlay(howToModal)">
        <div class="flex flex-column align-items-center">
            <div>
                <b style="font-weight: bold!important;">User id:</b> You can use your GEWIS number as user id. <br>
                <b style="font-weight: bold!important;">Pin:</b> You can (re)set your pin at https://sudosos.gewis.nl/
                <br>
            </div>
            <img src="@/assets/sudosos-qr.png" style="width: 25rem;" />
        </div>
    </Dialog>
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
const howToModalVisible: Ref<boolean> = ref < boolean > (false);
const howToModal: Ref<null | any> = ref(null);
</script>
