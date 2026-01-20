<template>
  <div class="flex flex-col h-screen">
    <div v-if="posNotLoaded" class="items-center flex flex-col h-screen justify-center">
      <div>
        <ProgressSpinner aria-label="Loading" />
      </div>
    </div>
    <div v-else class="mx-8 mt-8 bg-[#ffffffEE] shadow-lg flex-grow rounded-3xl min-h-0">
      <div class="wrapper">
        <div class="pos-wrapper">
          <TopUpWarningComponent
            v-if="shouldShowTopUpWarning"
            :show="showTopUpWarning"
            @update:show="handleTopUpWarningUpdate"
          />
          <UserSearchComponent v-if="currentState === PointOfSaleState.SEARCH_USER" @cancel-search="cancelSearch()" />
          <PointOfSaleDisplayComponent
            v-if="currentState === PointOfSaleState.DISPLAY_POS"
            :point-of-sale="currentPos"
          />
          <BuyerSelectionComponent
            v-if="currentState === PointOfSaleState.SELECT_CREATOR"
            @cancel-select-creator="cancelSelectCreator()"
          />
          <ActivityComponent />
        </div>
        <div class="cart-wrapper">
          <CartComponent @select-creator="selectCreator()" @select-user="selectUser()" />
        </div>
      </div>
    </div>
    <div class="flex flex-row">
      <SettingsIconComponent />
      <ScannersUpdateComponent :handle-nfc-delete="nfcDelete" :handle-nfc-update="nfcUpdate" />
    </div>
    <NfcSearchComponent :handle-nfc-search="cartStore.setBuyerFromNfc" />
  </div>
</template>
<script setup lang="ts">
import { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { computed, onMounted, Ref, ref, watch } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { usePosToken } from '@/composables/usePosToken';
import PointOfSaleDisplayComponent from '@/components/PointOfSaleDisplay/PointOfSaleDisplayComponent.vue';
import SettingsIconComponent from '@/components/SettingsIconComponent.vue';
import CartComponent from '@/components/Cart/CartComponent.vue';
import { useActivityStore } from '@/stores/activity.store';
import ActivityComponent from '@/components/ActivityComponent.vue';
import UserSearchComponent from '@/components/UserSearch/UserSearchComponent.vue';
import BuyerSelectionComponent from '@/components/BuyerSelect/BuyerSelectionComponent.vue';
import ScannersUpdateComponent from '@/components/ScannersUpdateComponent.vue';
import NfcSearchComponent from '@/components/NfcSearchComponent.vue';
import apiService from '@/services/ApiService';
import { useCartStore } from '@/stores/cart.store';
import TopUpWarningComponent from '@/components/TopUpWarningComponent.vue';
import { useSettingStore } from '@/stores/settings.store';

const authStore = useAuthStore();
const posNotLoaded = ref(true);
const currentPos: Ref<PointOfSaleWithContainersResponse | undefined> = ref(undefined);
const pointOfSaleStore = usePointOfSaleStore();
const activityStore = useActivityStore();
const cartStore = useCartStore();
const shouldShowTimers = useSettingStore().showTimers;
const { getPosIdFromToken } = usePosToken();

enum PointOfSaleState {
  SEARCH_USER,
  DISPLAY_POS,
  SELECT_CREATOR,
}

const currentState = ref(PointOfSaleState.DISPLAY_POS);

const showTopUpWarning = ref(false);
const hasShownTopUpWarning = ref(false);

const shouldShowTopUpWarning = computed(() => {
  const inDebt = cartStore.checkBuyerInDebt();
  return inDebt && !hasShownTopUpWarning.value && shouldShowTimers;
});

const handleTopUpWarningUpdate = (value: boolean) => {
  showTopUpWarning.value = value;
  if (!value) {
    hasShownTopUpWarning.value = true;
  }
};

const fetchPointOfSale = async () => {
  const storedPos = pointOfSaleStore.getPos;
  const target = storedPos?.id ?? getPosIdFromToken();

  if (!target) {
    console.error('No POS ID available');
    posNotLoaded.value = false;
    return;
  }

  // If POS is already cached, use it immediately (no loading screen)
  if (storedPos) {
    currentPos.value = storedPos;
    posNotLoaded.value = false;

    if (shouldShowTimers) {
      activityStore.restartTimer();
    }

    if (shouldShowTopUpWarning.value) {
      showTopUpWarning.value = true;
    }

    // Refresh in background to ensure data is up-to-date
    void pointOfSaleStore.fetchPointOfSale(target).catch((err) => {
      // Log the error for debugging purposes while still continuing with cached data
      console.warn('Background POS refresh failed:', err);
    });

    return;
  }

  // No cached POS - fetch with loading screen
  await pointOfSaleStore.fetchPointOfSale(target).finally(() => {
    if (pointOfSaleStore.pointOfSale) {
      currentPos.value = pointOfSaleStore.pointOfSale;
    }
    posNotLoaded.value = false;

    if (shouldShowTimers) {
      activityStore.restartTimer();
    }

    if (shouldShowTopUpWarning.value) {
      showTopUpWarning.value = true;
    }
  });
};

onMounted(fetchPointOfSale);

const selectUser = () => {
  currentState.value = PointOfSaleState.SEARCH_USER;
};

const cancelSearch = () => {
  currentState.value = PointOfSaleState.DISPLAY_POS;
};

const selectCreator = () => {
  currentState.value = PointOfSaleState.SELECT_CREATOR;
};

const cancelSelectCreator = () => {
  currentState.value = PointOfSaleState.DISPLAY_POS;
};

watch(
  () => pointOfSaleStore.pointOfSale,
  (newPos) => {
    if (newPos) currentPos.value = newPos;
  },
);

const nfcUpdate = async (nfcCode: string) => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    await apiService.user.updateUserNfc(userId, { nfcCode: nfcCode });
  } catch (error) {
    console.error(error);
  }
};

const nfcDelete = async () => {
  const userId = authStore.user?.id;
  if (!userId) {
    throw new Error('No user logged in.');
  }

  try {
    await apiService.user.deleteUserNfc(userId);
  } catch {
    throw new Error('There is no NFC code linked to your account.');
  }
};
</script>
<style scoped lang="scss">
.wrapper {
  display: flex;
  height: 100%;
  padding: 35px 15px 25px 35px;
}

.pos-wrapper {
  width: calc(100% - 350px);
}

.cart-wrapper {
  width: 350px;
}
</style>
