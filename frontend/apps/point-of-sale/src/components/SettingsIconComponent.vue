<template>
  <div class="m-5 cursor-pointer" @click="openSettings">
    <div class="pi pi-cog" style="font-size: 3rem" />
  </div>
  <Dialog
    ref="settings"
    v-model:visible="visible"
    header="Switch Point of Sale"
    modal
    :style="{ width: '70vw', maxWidth: '900px' }"
    @show="addListenerOnDialogueOverlay(settings!)"
  >
    <div v-if="pointOfSale" class="space-y-6">
      <div>
        <div v-if="loadingPos" class="flex justify-center py-8">
          <ProgressSpinner style="width: 50px; height: 50px" />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(posGroup, ownerName) in groupedPos"
            :key="ownerName"
            class="space-y-2"
            :class="{ 'md:col-span-2': posGroup.length > 2 }"
          >
            <h4 class="text-lg font-medium font-semibold text-gray-700">{{ ownerName }}</h4>
            <div class="grid gap-3" :class="posGroup.length > 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'">
              <Button
                v-for="pos in posGroup"
                :key="pos.id"
                class="text-left justify-start h-auto py-3 px-4"
                :outlined="pointOfSale.id !== pos.id"
                @click="switchToPos(pos)"
              >
                <div class="flex flex-col items-start">
                  <span class="font-semibold">{{ pos.name }}</span>
                  <span v-if="pointOfSale.id === pos.id" class="text-sm opacity-75">(Current)</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 pt-4 justify-end">
        <Button class="px-3 py-2" outlined @click="visible = false">
          <i class="pi pi-times mr-2" />
          Close
        </Button>
        <Button class="px-3 py-2 logout-button" @click="forceExit">
          <i class="pi pi-sign-out mr-2" />
          Force logout
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from 'vue';
import { addListenerOnDialogueOverlay, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { StoreGeneric, storeToRefs } from 'pinia';
import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import { SudososRed } from '@sudosos/themes';
import { usePreset } from '@primeuix/themes';
import ProgressSpinner from 'primevue/progressspinner';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { PointOfSaleSwitchService } from '@/services/PointOfSaleSwitchService';
import { logoutService } from '@/services/logoutService';

const visible = ref(false);
const settings: Ref<{ mask: HTMLElement; close: () => void } | null> = ref(null);
const posStore = usePointOfSaleStore();
const authStore = useAuthStore();
const loadingPos = ref(false);

const { usersPointOfSales, pointOfSale } = storeToRefs(posStore as StoreGeneric);

const groupedPos = computed(() => {
  if (!usersPointOfSales.value) return {};

  const groups: Record<string, PointOfSaleResponse[]> = {};

  usersPointOfSales.value.forEach((pos: PointOfSaleResponse) => {
    const ownerName = pos.owner?.firstName || 'Unknown';
    if (!groups[ownerName]) {
      groups[ownerName] = [];
    }
    groups[ownerName].push(pos);
  });

  // Sort by number of POS (descending)
  const sortedEntries = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

  // Convert back to object with sorted order
  const sortedGroups: Record<string, PointOfSaleResponse[]> = {};
  sortedEntries.forEach(([ownerName, posList]) => {
    sortedGroups[ownerName] = posList;
  });

  return sortedGroups;
});

const switchToPos = (pos: PointOfSaleResponse) => {
  if (pointOfSale.value?.id === pos.id) return;
  visible.value = false;
  PointOfSaleSwitchService.switchTo(pos);
};

const forceExit = async () => {
  // This is pretty dirty, but this will be fixed with POS Authentication (I think/hope)
  usePreset(SudososRed);
  await logoutService(true); // Force clear all POS data
};

const openSettings = async () => {
  visible.value = true;
  const user = authStore.getUser;
  if (user && !posStore.usersPointOfSales) {
    loadingPos.value = true;
    await posStore.fetchUserPointOfSale(user.id);
    loadingPos.value = false;
  }
};
</script>

<style lang="scss">
.logout-button {
  background-color: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: white;
}
</style>
