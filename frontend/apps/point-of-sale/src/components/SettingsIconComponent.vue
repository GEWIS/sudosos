<template>
  <div class="settings-icon" @click="openSettings">
    <div class="pi pi-cog text-6xl"/>
  </div>
  <Dialog v-model:visible="visible" ref="settings" modal header="Settings" :style="{ width: '50vw' }"
          @show="addListenerOnDialogueOverlay(settings)"
          :pt="{
        header: () => ({class: ['dialog-header']}),
        closeButton: () => ({class: ['dialog-close']})}" >
    <div>
      <p v-if="pointOfSale">
        Switch POS to
        <Dropdown v-model="selectedPos" :options="options" :loading="loadingPos" optionLabel="Point of Sale"
                  placeholder="Select a POS" class="w-full md:w-14rem">
          <template #value="slotProps">
            {{ slotProps.value.name}}
          </template>
          <template #option="slotProps">
            {{slotProps.option.name}}
          </template>
        </Dropdown>
        <div class="mt-2">
          <button
            class="c-btn border-round-md active p-2 font-medium text-base"
            @click="forceExit"
          >
            Force logout and exit POS
          </button>
        </div>
      <!-- eslint-disable-next-line -->
      </p>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, Ref, ref, watch } from "vue";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { storeToRefs } from "pinia";
import { PointOfSaleResponse } from "@sudosos/sudosos-client";
import { PointOfSaleSwitchService } from "@/services/PointOfSaleSwitchService";
import { logoutService } from "@/services/logoutService";

const visible = ref(false);
const settings: Ref<null|any> = ref(null);
const posStore = usePointOfSaleStore();
const authStore = useAuthStore();
const selectedPos = ref<PointOfSaleResponse | null>(null);
const loadingPos = ref(false);

const { usersPointOfSales, pointOfSale } = storeToRefs(posStore);
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

const openSettings = () => {
  visible.value = true;
  selectedPos.value = pointOfSale.value as PointOfSaleResponse;
  const user = authStore.getUser;
  if (user && !posStore.usersPointOfSales) {
    loadingPos.value = true;
    posStore.fetchUserPointOfSale(user.id).then(() => {
      loadingPos.value = false;
    });
  }
};


</script>

<style lang="scss">
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
  left: 60px;
  font-size: 70px;
  cursor: pointer;
  bottom: 0;
  color: var(--accent-color);
}
</style>
