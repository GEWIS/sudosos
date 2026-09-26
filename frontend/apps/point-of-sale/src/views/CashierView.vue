<template>
  <div class="flex flex-col" :class="isMobile ? 'h-dvh' : 'h-screen'">
    <div v-if="posNotLoaded" class="items-center flex flex-col h-full justify-center">
      <div>
        <ProgressSpinner aria-label="Loading" />
      </div>
    </div>
    <div v-else-if="isMobile" class="flex flex-col h-full overflow-hidden bg-gray-50">
      <MobileUserSearchHeader ref="mobileHeader" @open-settings="mobileSettings?.openSettings()" />
      <MobileCategoryBar
        :categories="computedCategories"
        :selected-category-id="selectedCategoryId"
        @select-category="selectMobileCategory"
      />
      <TopUpWarningComponent
        v-if="shouldShowTopUpWarning"
        :show="showTopUpWarning"
        @update:show="handleTopUpWarningUpdate"
      />
      <div class="relative flex-1 min-h-0">
        <main
          ref="mobileMain"
          class="h-full overflow-y-auto"
          :class="
            cartStore.cartTotalCount > 0
              ? 'pb-[calc(6rem+env(safe-area-inset-bottom))]'
              : 'pb-[env(safe-area-inset-bottom)]'
          "
        >
          <div class="px-3 pt-2 text-sm empty:hidden"><ActivityComponent /></div>
          <MobileProductList
            ref="mobileProductList"
            :alcohol-time-today="alcoholTimeToday"
            :point-of-sale="currentPos"
            :selected-category-id="selectedCategoryId"
            :should-show-alcohol-warning="!!shouldShowAlcoholWarning"
          />
        </main>
        <MobileCartActionBar :flow="checkoutFlow" @select-user="mobileHeader?.openSearch()" />
      </div>
      <div
        v-if="currentState === PointOfSaleState.SELECT_CREATOR"
        class="fixed inset-0 z-40 overflow-y-auto bg-white p-3"
      >
        <BuyerSelectionComponent @cancel-select-creator="cancelSelectCreator()" />
      </div>
      <SettingsIconComponent ref="mobileSettings" hide-trigger />
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
            :categories="posCategories"
            :point-of-sale="currentPos"
          />
          <BuyerSelectionComponent
            v-if="currentState === PointOfSaleState.SELECT_CREATOR"
            @cancel-select-creator="cancelSelectCreator()"
          />
          <ActivityComponent />
        </div>
        <div class="cart-wrapper">
          <CartComponent :flow="checkoutFlow" @select-user="selectUser()" />
        </div>
      </div>
    </div>
    <div v-if="!isMobile" class="flex flex-row">
      <SettingsIconComponent />
      <ScannersUpdateComponent :handle-nfc-delete="nfcDelete" :handle-nfc-update="nfcUpdate" />
    </div>
    <NfcSearchComponent :handle-nfc-search="cartStore.setBuyerFromNfc" />
    <!-- Outside the layout switch: rotating a phone past the breakpoint swaps
         layouts, and must not unmount the dialogs of a checkout in progress. -->
    <CheckoutDialogs :flow="checkoutFlow" />
    <TerminalPaymentModal v-model:show="terminalPaymentStore.dialogVisible" />
  </div>
</template>
<script setup lang="ts">
import { PointOfSaleWithContainersResponse } from '@gewis/sudosos-client';
import { computed, onMounted, Ref, ref, useTemplateRef, watch } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { storeToRefs } from 'pinia';
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
import { userApiService } from '@/services/ApiService';
import { useCartStore } from '@/stores/cart.store';
import TopUpWarningComponent from '@/components/TopUpWarningComponent.vue';
import { useSettingStore } from '@/stores/settings.store';
import { useIsMobile } from '@/composables/useIsMobile';
import { usePosCategories } from '@/composables/usePosCategories';
import MobileUserSearchHeader from '@/components/Mobile/MobileUserSearchHeader.vue';
import MobileProductList from '@/components/Mobile/MobileProductList.vue';
import MobileCartActionBar from '@/components/Mobile/MobileCartActionBar.vue';
import MobileCategoryBar from '@/components/Mobile/MobileCategoryBar.vue';
import TerminalPaymentModal from '@/components/Cart/TerminalPaymentModal.vue';
import { useTerminalPaymentStore } from '@/stores/terminalPayment.store';
import CheckoutDialogs from '@/components/Cart/CheckoutDialogs.vue';
import { useCheckoutFlow } from '@/composables/useCheckoutFlow';

const authStore = useAuthStore();
const posNotLoaded = ref(true);
const currentPos: Ref<PointOfSaleWithContainersResponse | undefined> = ref(undefined);
const pointOfSaleStore = usePointOfSaleStore();
const activityStore = useActivityStore();
const cartStore = useCartStore();
const terminalPaymentStore = useTerminalPaymentStore();
const { checkBuyerInDebt, buyerBalance } = storeToRefs(cartStore);
const settingStore = useSettingStore();
const shouldShowTimers = computed(() => settingStore.showTimers);
const { getPosIdFromToken } = usePosToken();

enum PointOfSaleState {
  SEARCH_USER,
  DISPLAY_POS,
  SELECT_CREATOR,
}

const currentState = ref(PointOfSaleState.DISPLAY_POS);

const { isMobile } = useIsMobile();
const mobileHeader = useTemplateRef('mobileHeader');
const mobileSettings = useTemplateRef('mobileSettings');
const mobileMain = useTemplateRef('mobileMain');
const mobileProductList = useTemplateRef('mobileProductList');

// Shared by both layouts, so the selected category survives switching between them.
const posCategories = usePosCategories(currentPos);
const { computedCategories, selectedCategoryId, selectCategory, shouldShowAlcoholWarning, alcoholTimeToday } =
  posCategories;

const selectMobileCategory = (categoryId: string) => {
  selectCategory(categoryId);
  mobileProductList.value?.clearSearch();
  mobileMain.value?.scrollTo({ top: 0 });
};

// The mobile layout has no SEARCH_USER screen (the header handles search), so
// don't get stuck in it when the window shrinks past the breakpoint.
watch(isMobile, (mobile) => {
  if (mobile && currentState.value === PointOfSaleState.SEARCH_USER) {
    currentState.value = PointOfSaleState.DISPLAY_POS;
  }
});

const showTopUpWarning = ref(false);
const hasCheckedDebtAfterLogin = ref(false);

const shouldShowTopUpWarning = computed(() => {
  const buyer = cartStore.getBuyer;
  const loggedInUser = authStore.getUser;
  const isBuyerLoggedInUser = buyer && loggedInUser && buyer.id === loggedInUser.id;
  return checkBuyerInDebt.value && shouldShowTimers.value && isBuyerLoggedInUser;
});

const handleTopUpWarningUpdate = (value: boolean) => {
  showTopUpWarning.value = value;
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

    if (shouldShowTimers.value) {
      activityStore.restartTimer();
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

    if (shouldShowTimers.value) {
      activityStore.restartTimer();
    }
  });
};

onMounted(() => {
  void fetchPointOfSale();
});

const hasFetchedRecentUsers = ref(false);

watch(
  () => [pointOfSaleStore.pointOfSale, settingStore.isBorrelmode] as const,
  ([newPos, isBorrelmode]) => {
    if (!hasFetchedRecentUsers.value && newPos && !isBorrelmode) {
      hasFetchedRecentUsers.value = true;
      void pointOfSaleStore.fetchRecentUsers();
    }
  },
);

const selectUser = () => {
  currentState.value = PointOfSaleState.SEARCH_USER;
};

const cancelSearch = () => {
  currentState.value = PointOfSaleState.DISPLAY_POS;
};

const selectCreator = () => {
  currentState.value = PointOfSaleState.SELECT_CREATOR;
};

// Created here rather than in the checkout buttons so a countdown or a pending
// age verification survives switching between the kiosk and mobile layouts.
const checkoutFlow = useCheckoutFlow(selectCreator);

const cancelSelectCreator = () => {
  currentState.value = PointOfSaleState.DISPLAY_POS;
};

watch(
  () => pointOfSaleStore.pointOfSale,
  (newPos) => {
    if (newPos) currentPos.value = newPos;
  },
);

watch(
  () => buyerBalance.value,
  (newBalance) => {
    if (!hasCheckedDebtAfterLogin.value && newBalance !== null && shouldShowTopUpWarning.value) {
      showTopUpWarning.value = true;
      hasCheckedDebtAfterLogin.value = true;
    }
  },
  { immediate: true },
);

const nfcUpdate = async (nfcCode: string) => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    await userApiService.user.updateUserNfc({ id: userId, updateNfcRequest: { nfcCode: nfcCode } });
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
    await userApiService.user.deleteUserNfc({ id: userId });
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
