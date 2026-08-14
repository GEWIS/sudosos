import { computed, ref } from 'vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import router from '@/router';
import { useCartStore } from '@/stores/cart.store';
import apiService, { posApiService, userApiService } from '@/services/ApiService';
import { usePointOfSaleStore } from '@/stores/pos.store';

export function useLoginForm() {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const posStore = usePointOfSaleStore();

  const userId = ref('');
  const pinCode = ref('');
  const enteringUserId = ref(true);
  const loggingIn = ref(false);
  const wrongPin = ref(false);
  const showDeactivatedModal = ref(false);
  const maxUserIdLength = 5;
  const maxPasscodeLength = 4;
  const maxUserId = 40000;
  const external = ref<boolean>(false);

  const switchInput = () => {
    enteringUserId.value = !enteringUserId.value;
  };

  const focusPasscode = () => {
    if (enteringUserId.value) switchInput();
  };

  const focusUserId = () => {
    if (!enteringUserId.value) switchInput();
  };

  const handleExternal = () => {
    external.value = !external.value;
  };

  const displayContainerClasses = computed(() => ({
    'ml-[-23rem]': !enteringUserId.value,
  }));

  const loginSuccess = async () => {
    const user = authStore.getUser;
    if (user === null) return;

    if (!user.active) {
      showDeactivatedModal.value = true;
      return;
    }

    void useCartStore().setBuyer(user);
    void userStore.fetchCurrentUserBalance(user.id, apiService);

    await router.push({ path: '/cashier' });
    userId.value = '';
    pinCode.value = '';
    enteringUserId.value = true;
  };

  const dismissDeactivatedModal = () => {
    authStore.logout();
    showDeactivatedModal.value = false;
    userId.value = '';
    pinCode.value = '';
    enteringUserId.value = true;
  };

  const loginFail = () => {
    pinCode.value = '';
    wrongPin.value = true;
  };

  const login = () => {
    loggingIn.value = true;

    const pos = posStore.getPos;
    if (!pos) {
      loggingIn.value = false;
      return;
    }

    if (external.value) {
      authStore
        .externalPinLogin(userId.value, pinCode.value, pos.id, posApiService, userApiService)
        .then(async () => {
          await loginSuccess();
        })
        .catch((error) => {
          console.error(error);
          loginFail();
        })
        .finally(() => {
          loggingIn.value = false;
        });
    } else {
      authStore
        .gewisPinlogin(userId.value, pinCode.value, pos.id, posApiService, userApiService)
        .then(async () => {
          await loginSuccess();
        })
        .catch((error) => {
          console.error(error);
          loginFail();
        })
        .finally(() => {
          loggingIn.value = false;
        });
    }
  };

  const shouldShowBanner = computed(() => {
    const minHeightThreshold = 950;
    const screenHeight = window.innerHeight;

    const screenWidth = window.innerWidth;
    const minWidthThreshold = 1280;

    return screenHeight >= minHeightThreshold && screenWidth >= minWidthThreshold;
  });

  return {
    userId,
    pinCode,
    enteringUserId,
    loggingIn,
    wrongPin,
    showDeactivatedModal,
    maxUserIdLength,
    maxPasscodeLength,
    maxUserId,
    external,
    switchInput,
    focusPasscode,
    focusUserId,
    handleExternal,
    displayContainerClasses,
    loginSuccess,
    loginFail,
    login,
    dismissDeactivatedModal,
    shouldShowBanner,
  };
}
