<template>
  <div class="flex flex-col h-screen">
    <div class="m-5 mb-0 p-5 bg-[#ffffffEE] shadow-lg rounded-lg flex-grow">
      <div v-if="loggingIn" class="items-center flex h-full justify-center">
        <div>
          <ProgressSpinner aria-label="Loading" />
        </div>
      </div>
      <div v-else class="flex justify-center mt-8">
        <div class="flex flex-col items-start w-[20rem]">
          <div
            class="flex flex-row space-between transition-all duration-500 ease-in-out mb-5"
            :class="displayContainerClasses"
          >
            <KeypadDisplayComponent
              :external="external"
              :is-active="enteringUserId"
              :pin-code="pinCode"
              :user-id="userId"
              :wrong-pin="wrongPin"
              @focus:passcode="focusPasscode"
              @focus:userid="focusUserId"
            />
          </div>
          <KeypadComponent
            @backspace="handleBackspace"
            @continue="handleContinue"
            @external="handleExternal"
            @input="handleInput"
          />
        </div>
        <BannerComponent v-if="shouldShowBanner" />
      </div>
    </div>
    <div class="m-2 flex justify-between">
      <PosInfo />
      <GitInfo />
    </div>
    <ScannersLoginComponent :handle-ean-login="eanLogin" :handle-nfc-login="nfcLogin" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import KeypadComponent from '@/components/Keypad/KeypadComponent.vue';
import KeypadDisplayComponent from '@/components/Keypad/KeypadDisplayComponent.vue';
import { posApiService, userApiService } from '@/services/ApiService';
import BannerComponent from '@/components/Banner/BannerComponent.vue';
import ScannersLoginComponent from '@/components/ScannersLoginComponent.vue';
import GitInfo from '@/components/GitInfo.vue';
import PosInfo from '@/components/PosInfo.vue';
import { useLoginForm } from '@/composables/useLoginForm';
import { usePointOfSaleStore } from '@/stores/pos.store';

const authStore = useAuthStore();
const posStore = usePointOfSaleStore();

const {
  userId,
  pinCode,
  enteringUserId,
  loggingIn,
  wrongPin,
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
  login,
  shouldShowBanner,
} = useLoginForm();

const handleInput = (value: string) => {
  if (wrongPin.value) wrongPin.value = false;

  if (enteringUserId.value) {
    if (userId.value.length >= maxUserIdLength) return;
    userId.value += value;
    if (userId.value.length === maxUserIdLength || (Number(userId.value) * 10 > maxUserId && !external.value)) {
      switchInput();
    }
  } else {
    if (pinCode.value.length >= maxPasscodeLength) return;
    pinCode.value += value;
    if (pinCode.value.length === maxPasscodeLength) {
      login();
    }
  }
};

const handleBackspace = () => {
  wrongPin.value = false;
  if (userId.value.length == 0 && enteringUserId.value && external.value) external.value = false;

  if (pinCode.value.length === 0 && !enteringUserId.value) {
    switchInput();
  } else {
    if (enteringUserId.value) userId.value = userId.value.slice(0, -1);
    if (!enteringUserId.value) pinCode.value = pinCode.value.slice(0, -1);
  }
};

const nfcLogin = async (nfcCode: string) => {
  try {
    const pos = posStore.getPos;
    if (!pos) {
      return;
    }
    await authStore.secureNfcLogin(nfcCode, pos.id, posApiService, userApiService).then(async () => {
      await loginSuccess();
    });
  } catch (error) {
    console.error(error);
  }
};

const eanLogin = async (eanCode: string) => {
  throw new Error('No secure ean login has been implemented yet');
  try {
    await authStore.eanLogin(eanCode, userApiService).then(async () => {
      await loginSuccess();
    });
  } catch (error) {
    console.error(error);
  }
};

const handleContinue = () => {
  switchInput();
};
</script>

<style scoped></style>
