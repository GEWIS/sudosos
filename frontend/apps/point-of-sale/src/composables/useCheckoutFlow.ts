import { computed, ref } from 'vue';
import { logoutService } from '@/services/logoutService';
import { useCartStore } from '@/stores/cart.store';
import { useSettingStore } from '@/stores/settings.store';
import { useTerminalPaymentStore } from '@/stores/terminalPayment.store';
import { useCheckoutTimer } from '@/composables/useCheckoutTimer';
import { playAudio, Sound } from '@/utils/audioUtil';

const STEEKPROEF_CHANCE = 0.45;

/**
 * Everything behind the checkout button: the countdown, the age verification
 * and April Fools interludes, and anonymous terminal payments. Render
 * CheckoutDialogs with the returned flow to show the dialogs it drives. The
 * terminal payment dialog is the exception: CashierView renders that one, so
 * a payment in progress survives switching between the kiosk and mobile layouts.
 *
 * @param onSelectCreator called in borrel mode, where checking out means
 *   picking which POS associate the sale is created by.
 */
export function useCheckoutFlow(onSelectCreator: () => void) {
  const settings = useSettingStore();
  const cartStore = useCartStore();
  const cartItems = cartStore.getProducts;
  const borrelMode = computed(() => settings.isBorrelmode);
  const buyer = computed(() => cartStore.getBuyer);

  const {
    duration,
    checkingOut,
    checkout: checkoutWithTimer,
    stopCheckout,
    showDebtWarningDialog,
    resetDialog,
  } = useCheckoutTimer(() => playAudio(Sound.CASHOUT));

  const checkoutText = computed(() => {
    if (checkingOut.value) return duration.value;

    if (!buyer.value) return 'Charge someone';
    return 'Checkout';
  });

  const enabled = computed(() => {
    return cartItems.length > 0 && !!buyer.value;
  });

  const terminalPaymentStore = useTerminalPaymentStore();
  const showTerminalPayment = computed({
    get: () => terminalPaymentStore.dialogVisible,
    set: (value: boolean) => (terminalPaymentStore.dialogVisible = value),
  });

  // Terminal payments are anonymous for now: the sale is booked in the name of
  // the POS itself. That only makes sense in borrel mode, where "select no one"
  // exists -- an authenticated POS always has someone to charge, so the
  // terminal button is only rendered in borrel mode.
  const terminalEnabled = computed(() => cartItems.length > 0 && !buyer.value);

  const payWithTerminal = () => {
    if (!terminalEnabled.value || showTerminalPayment.value) return;

    stopCheckout();
    showTerminalPayment.value = true;
  };

  const logout = async () => {
    stopCheckout();
    await logoutService();
  };

  const showAprilFools = ref(false);
  let pendingCheckoutArgs: { onSelectCreator: () => void; isBorrelMode: boolean } | null = null;

  const showAgeVerification = ref(false);
  let pendingAgeVerificationArgs: { onSelectCreator: () => void; isBorrelMode: boolean } | null = null;

  const proceedToCheckoutTimer = (onSelectCreator: () => void, isBorrelMode: boolean) => {
    if (settings.showAprilFools && Math.random() < STEEKPROEF_CHANCE) {
      pendingCheckoutArgs = { onSelectCreator, isBorrelMode };
      showAprilFools.value = true;
    } else {
      checkoutWithTimer(onSelectCreator, isBorrelMode);
    }
  };

  const onAprilFoolsClosed = () => {
    if (pendingCheckoutArgs) {
      const { onSelectCreator, isBorrelMode } = pendingCheckoutArgs;
      pendingCheckoutArgs = null;
      checkoutWithTimer(onSelectCreator, isBorrelMode);
    }
  };

  const onAgeVerificationConfirmed = () => {
    if (pendingAgeVerificationArgs) {
      const { onSelectCreator, isBorrelMode } = pendingAgeVerificationArgs;
      pendingAgeVerificationArgs = null;
      proceedToCheckoutTimer(onSelectCreator, isBorrelMode);
    }
  };

  const onAgeVerificationDenied = () => {
    cartStore.removeAlcoholicProducts();
    pendingAgeVerificationArgs = null;
  };

  const checkout = () => {
    if (!enabled.value) return;

    const isBorrelMode = borrelMode.value;

    if (checkingOut.value) {
      checkoutWithTimer(onSelectCreator, isBorrelMode);
      return;
    }

    if (settings.showAprilFools && cartStore.hasAlcoholicProducts) {
      pendingAgeVerificationArgs = { onSelectCreator, isBorrelMode };
      showAgeVerification.value = true;
    } else {
      proceedToCheckoutTimer(onSelectCreator, isBorrelMode);
    }
  };

  return {
    borrelMode,
    buyer,
    duration,
    checkingOut,
    checkoutText,
    enabled,
    checkout,
    stopCheckout,
    showDebtWarningDialog,
    resetDialog,
    showAprilFools,
    onAprilFoolsClosed,
    showAgeVerification,
    onAgeVerificationConfirmed,
    onAgeVerificationDenied,
    showTerminalPayment,
    terminalEnabled,
    payWithTerminal,
    logout,
  };
}

export type CheckoutFlow = ReturnType<typeof useCheckoutFlow>;
