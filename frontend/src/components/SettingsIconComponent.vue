<template>
  <div class="settings-icon" @click="openSettings">
    <font-awesome-icon icon="fa-solid fa-cog" />
  </div>
  <Dialog v-model:visible="visible" ref="settings" modal header="Settings" :style="{ width: '50vw' }" @show="addListenerOnDialogueOverlay(settings)"
          :pt="{
        header: () => ({class: ['dialog-header']}),
        closeButton: () => ({class: ['dialog-close']})}" >
    <p>
    Switch POS to
    </p>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";

const visible = ref(false);
const settings: Ref<null|any> = ref(null);
const posStore = usePointOfSaleStore();
const authStore = useAuthStore();
const openSettings = () => {
  visible.value = true;
  const user = authStore.getUser;
  console.error(user);
  if (user) posStore.fetchUserPointOfSale(user.id);
};


</script>

<style>
.dialog-header {
  background: var(--accent-color)!important;
  color: white!important;
}

.dialog-close {
  color: white!important;
}
.settings-icon {
  height: 100px;
  position: fixed;
  bottom: -35px;
  left: 60px;
  font-size: 70px;
  cursor: pointer;
}
</style>
