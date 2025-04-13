<template>
  <div class="settings-icon" @click="openSettings">
    <div class="pi pi-cog text-6xl" />
  </div>
  <Dialog
    ref="settings"
    v-model:visible="visible"
    header="Settings"
    modal
    :pt="{
      header: () => ({ class: ['dialog-header'] }),
      closeButton: () => ({ class: ['dialog-close'] }),
    }"
    :style="{ width: '50vw' }"
    @show="addListenerOnDialogueOverlay(settings!)"
  >
    <div>
      <div v-if="pointOfSale">
        Switch POS to
        <Dropdown
          v-model="selectedPos"
          class="md:w-14rem w-full"
          :loading="loadingPos"
          option-label="Point of Sale"
          :options="options"
          placeholder="Select a POS"
        >
          <template #value="slotProps">
            {{ slotProps.value.name }}
          </template>
          <template #option="slotProps">
            {{ slotProps.option.name }}
          </template>
        </Dropdown>
        <div class="mt-2">
          <button class="active border-round-md c-btn font-medium p-2 text-base" @click="forceExit">
            Force logout and exit POS
          </button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, Ref, ref, watch } from 'vue';
import { addListenerOnDialogueOverlay, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { StoreGeneric, storeToRefs } from 'pinia';
import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { PointOfSaleSwitchService } from '@/services/PointOfSaleSwitchService';
import { logoutService } from '@/services/logoutService';

const visible = ref(false);
const settings: Ref<{ mask: HTMLElement; close: () => void } | null> = ref(null);
const posStore = usePointOfSaleStore();
const authStore = useAuthStore();
const selectedPos = ref<PointOfSaleResponse | null>(null);
const loadingPos = ref(false);

const { usersPointOfSales, pointOfSale } = storeToRefs(posStore as StoreGeneric);
const options = computed(() => {
  return usersPointOfSales.value ? usersPointOfSales.value : [];
});

watch(selectedPos, () => {
  const target = selectedPos.value;
  if (!target) return;
  PointOfSaleSwitchService.switchTo(target);
});

const forceExit = async () => {
  usePointOfSaleStore().$reset();
  await logoutService();
};

const openSettings = async () => {
  visible.value = true;
  selectedPos.value = pointOfSale.value as PointOfSaleResponse;
  const user = authStore.getUser;
  if (user && !posStore.usersPointOfSales) {
    loadingPos.value = true;
    await posStore.fetchUserPointOfSale(user.id);
    loadingPos.value = false;
  }
};
</script>

<style lang="scss">
.dialog-header {
  background: var(--accent-color) !important;
  color: white !important;
}

.dialog-close {
  color: white !important;
}
.settings-icon {
  height: 100px;
  position: fixed;
  left: 60px;
  font-size: 70px;
  cursor: pointer;
  bottom: 0;
  color: var(--accent-color);
}
</style>
