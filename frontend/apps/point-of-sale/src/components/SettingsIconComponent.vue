<template>
  <div class="m-5 cursor-pointer" @click="openSettings">
    <div class="pi pi-cog" style="font-size: 3rem" />
  </div>
  <Dialog
    ref="settings"
    v-model:visible="visible"
    header="Settings"
    modal
    :style="{ width: '50vw' }"
    @show="addListenerOnDialogueOverlay(settings!)"
  >
    <div>
      <div v-if="pointOfSale">
        Switch POS to
        <Select
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
        </Select>
        <div class="mt-2">
          <Button class="active rounded-md font-md p-2 text-base" @click="forceExit">
            Force logout and exit POS
          </Button>
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
import { SudososRed } from '@sudosos/themes';
import { usePreset } from '@primeuix/themes';
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
  // This is pretty dirty, but this will be fixed with POS Authentication (I think/hope)
  usePreset(SudososRed);
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

<style lang="scss"></style>
