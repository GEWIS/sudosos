<template>
  <div v-if="posNotLoaded" class="align-items-center flex h-full justify-content-center">
    <div>
      <ProgressSpinner aria-label="Loading" />
    </div>
  </div>
  <div v-else class="main-content">
    <div class="wrapper">
      <div class="pos-wrapper">
        <TopUpWarningComponent
          v-if="shouldShowTopUpWarning"
          :show="showTopUpWarning"
          @update:show="handleTopUpWarningUpdate"
        />
        <UserSearchComponent v-if="currentState === PointOfSaleState.SEARCH_USER" @cancel-search="cancelSearch()" />
        <PointOfSaleDisplayComponent v-if="currentState === PointOfSaleState.DISPLAY_POS" :point-of-sale="currentPos" />
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
  <SettingsIconComponent />
  <ScannersUpdateComponent :handle-nfc-update="nfcUpdate" />
  <NfcSearchComponent :handle-nfc-search="cartStore.setBuyerFromNfc" />
</template>
<script setup lang="ts">
import { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { computed, onMounted, Ref, ref, watch } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { usePointOfSaleStore } from '@/stores/pos.store';
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

const authStore = useAuthStore();
const posNotLoaded = ref(true);
const currentPos: Ref<PointOfSaleWithContainersResponse | undefined> = ref(undefined);
const pointOfSaleStore = usePointOfSaleStore();
const activityStore = useActivityStore();
const cartStore = useCartStore();

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
  return inDebt && !hasShownTopUpWarning.value;
});

const handleTopUpWarningUpdate = (value: boolean) => {
  showTopUpWarning.value = value;
  if (!value) {
    hasShownTopUpWarning.value = true;
  }
};

const fetchPointOfSale = async () => {
  const storedPos = pointOfSaleStore.getPos;
  const target = storedPos ? storedPos.id : 1;

  await pointOfSaleStore
    .fetchPointOfSale(target)
    .catch(async () => {
      await pointOfSaleStore.fetchPointOfSale(1);
    })
    .finally(() => {
      if (pointOfSaleStore.pointOfSale) {
        currentPos.value = pointOfSaleStore.pointOfSale;
      }
      posNotLoaded.value = false;
      activityStore.restartTimer();

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

    await apiService.user.updateUserNfc(userId, { nfcCode: nfcCode }).then(async () => {});
  } catch (error) {
    console.error(error);
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
