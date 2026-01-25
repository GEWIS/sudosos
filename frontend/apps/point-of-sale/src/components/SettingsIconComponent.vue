<template>
  <div class="m-5 cursor-pointer" @click="openSettings">
    <div class="pi pi-cog" style="font-size: 3rem" />
  </div>
  <Dialog
    ref="settings"
    v-model:visible="visible"
    :draggable="false"
    header="Switch Point of Sale"
    modal
    :style="{ width: '70vw', maxWidth: '900px' }"
    @show="addListenerOnDialogueOverlay(settings!)"
  >
    <div class="space-y-6">
      <PosSwitchDisplay
        v-if="pointOfSale"
        :current-pos-id="pointOfSale.id"
        :grouped-pos="groupedPos"
        :loading="loadingPos"
        @select="handleSwitchToPos"
      />

      <div v-if="usersPointOfSales && usersPointOfSales.length > 0" class="flex gap-3 pt-4 justify-end">
        <Button class="px-3 py-2" @click="forceExit">
          <i class="pi pi-sign-out mr-2" />
          Force logout
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import { addListenerOnDialogueOverlay, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { storeToRefs } from 'pinia';
import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import PosSwitchDisplay from './PosSwitchDisplay.vue';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { logoutPosService, logoutService } from '@/services/logoutService';
import { usePointOfSaleSwitch } from '@/composables/usePointOfSaleSwitch';
import { usePointOfSaleOptions } from '@/composables/usePointOfSaleOptions';

const visible = ref(false);
const settings: Ref<{ mask: HTMLElement; close: () => void } | null> = ref(null);
const posStore = usePointOfSaleStore();
const authStore = useAuthStore();

const { pointOfSale, usersPointOfSales } = storeToRefs(posStore);
const { groupedPos, loadingPos, loadPosOptions } = usePointOfSaleOptions();
const { switchToPos } = usePointOfSaleSwitch();

const handleSwitchToPos = async (pos: PointOfSaleResponse) => {
  if (pointOfSale.value?.id === pos.id) return;
  visible.value = false;
  await switchToPos(pos);
  await logoutService();
};

const forceExit = async () => {
  await logoutPosService().then(() => {
    visible.value = false;
  });
};

const openSettings = async () => {
  visible.value = true;
  const user = authStore.getUser;
  if (user && !posStore.usersPointOfSales) {
    await loadPosOptions();
  }
};
</script>
