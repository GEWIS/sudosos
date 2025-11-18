import { ref, computed, watch, onUnmounted } from 'vue';
import { useCartStore } from '@/stores/cart.store';
import { logoutService } from '@/services/logoutService';

export function useCheckoutTimer(onFinalize?: () => void) {
  const cartStore = useCartStore();
  const duration = ref(3);
  const checkingOut = ref(false);
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const handleIntervalTick = async () => {
    duration.value -= 1;
    if (duration.value <= 0 && checkingOut.value) {
      await finalizeCheckout();
    }
  };

  const checkoutTimer = () =>
    setInterval(() => {
      void handleIntervalTick();
    }, 1000);

  const stopCheckout = () => {
    duration.value = 3;
    checkingOut.value = false;
    clearInterval(intervalId);
  };

  const unallowedUserInDebt = computed(() => cartStore.checkUnallowedUserInDebt());
  const showDebtWarning = ref(true);
  const showDebtWarningDialog = computed(() => {
    return unallowedUserInDebt.value && showDebtWarning.value;
  });

  const resetDialog = () => {
    showDebtWarning.value = false;
  };

  const finalizeCheckout = async () => {
    if (unallowedUserInDebt.value) {
      stopCheckout();
      showDebtWarning.value = true;
      return;
    }

    stopCheckout();
    if (onFinalize) {
      onFinalize();
    }
    await cartStore.checkout();
    checkingOut.value = false;
    duration.value = 3;
    await logoutService();
  };

  const startCheckout = (onSelectCreator?: () => void, borrelMode?: boolean) => {
    if (!cartStore.getProducts.length || !cartStore.getBuyer) return;
    if (unallowedUserInDebt.value) {
      stopCheckout();
      showDebtWarning.value = true;
      return;
    }

    if (borrelMode && onSelectCreator) {
      onSelectCreator();
      return;
    }

    if (cartStore.cartTotalCount === 0) return;
    if (checkingOut.value) return stopCheckout();
    checkingOut.value = true;
    intervalId = checkoutTimer();
  };

  watch(
    () => cartStore.getProducts,
    () => {
      stopCheckout();
    },
  );

  onUnmounted(() => {
    stopCheckout();
  });

  return {
    duration,
    checkingOut,
    checkout: startCheckout,
    stopCheckout,
    finalizeCheckout,
    showDebtWarningDialog,
    resetDialog,
  };
}
