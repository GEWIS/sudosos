<template>
  <div class="flex flex-col gap-4 min-h-0 h-full overflow-y-auto">
    <div>
      <h2 class="text-2xl font-bold">{{ pointOfSale?.name }}</h2>
      <p class="opacity-70">
        {{ settings.isBorrelmode ? 'Borrel till' : 'Log in for every sale' }} of {{ pointOfSale?.owner?.firstName }}
      </p>
    </div>

    <button v-if="settings.isBorrelmode" class="till-row" type="button" @click="emit('changeServing')">
      <i class="pi pi-user text-xl" />
      <span class="flex-1 text-left">
        <span class="block text-sm opacity-70">Serving as</span>
        <span class="font-semibold">{{
          servingAs ? `${servingAs.firstName} ${servingAs.lastName}` : 'Nobody yet'
        }}</span>
      </span>
      <i class="pi pi-chevron-right opacity-50" />
    </button>

    <div>
      <h3 class="section-label mb-2">Switch point of sale</h3>
      <PosSwitchDisplay
        v-if="pointOfSale"
        :current-pos-id="pointOfSale.id"
        :grouped-pos="groupedPos"
        :loading="loadingPos"
        @select="switchTo"
      />
    </div>

    <div class="flex flex-col gap-2 mt-auto">
      <Button class="py-3" @click="logout">
        <i class="pi pi-sign-out" />
        Log out {{ authStore.getUser?.firstName }}
      </Button>
      <Button v-if="usersPointOfSales?.length" class="py-3" outlined @click="forceExit">
        Force logout of this device
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { PointOfSaleResponse } from '@gewis/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import PosSwitchDisplay from '@/components/PosSwitchDisplay.vue';
import { PointOfSaleAssociate, usePointOfSaleStore } from '@/stores/pos.store';
import { useSettingStore } from '@/stores/settings.store';
import { usePointOfSaleOptions } from '@/composables/usePointOfSaleOptions';
import { usePointOfSaleSwitch } from '@/composables/usePointOfSaleSwitch';
import { logoutPosService, logoutService } from '@/services/logoutService';

defineProps<{ servingAs: PointOfSaleAssociate | null }>();
const emit = defineEmits<{ changeServing: [] }>();

const authStore = useAuthStore();
const settings = useSettingStore();
const posStore = usePointOfSaleStore();
const { pointOfSale, usersPointOfSales } = storeToRefs(posStore);
const { groupedPos, loadingPos, loadPosOptions } = usePointOfSaleOptions();
const { switchToPos } = usePointOfSaleSwitch();

// Same actions as the kiosk's settings dialog (SettingsIconComponent).
const switchTo = async (pos: PointOfSaleResponse) => {
  if (pointOfSale.value?.id === pos.id) return;
  await switchToPos(pos);
  await logoutService();
};

const logout = () => logoutService();
const forceExit = () => logoutPosService();

onMounted(() => {
  if (authStore.getUser && !posStore.usersPointOfSales) void loadPosOptions();
});
</script>

<style scoped lang="scss">
.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}

.till-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--p-surface-300);
  border-radius: var(--p-button-border-radius);
  background: white;
}
</style>
