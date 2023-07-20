<template>
  <div class="main-content">
    <div v-if="loggingIn" class="home-loader">
      <div>
        <ProgressSpinner aria-label="Loading" />
      </div>
    </div>
    <div class="keypad-container">
      <div class="display-container" :class="displayContainerClasses">
        <KeypadDisplayComponent :userId="userId" :pinCode="pinCode" :wrong-pin="wrongPin" :isActive="enteringUserId" />
      </div>
      <KeypadComponent @input="handleInput" @backspace="handleBackspace" @continue="handleContinue" />
      <!-- Your login content here -->
    </div>
  </div>
  <SettingsIconComponent />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SettingsIconComponent from "@/components/SettingsIconComponent.vue";
import KeypadComponent from "@/components/KeypadComponent.vue";
import KeypadDisplayComponent from "@/components/KeypadDisplayComponent.vue";
import router from "@/router";
import {useCartStore} from "@/stores/cart.store";
import {useAuthStore, useUserStore} from "@sudosos/sudosos-frontend-common";
import ApiService from "@/services/ApiService";

const userStore = useUserStore();
const authStore = useAuthStore();

let userId = ref('');
let pinCode = ref('');
const enteringUserId = ref(true);
const animateSwitch = ref(false);
const loggingIn = ref(false);
const wrongPin = ref(false);
const maxUserIdLength = 5;
const maxPasscodeLength = 4;
const maxUserId = 40000;

const handleInput = (value: string) => {
  if (wrongPin.value) wrongPin.value = false;

  if (enteringUserId.value) {
    if (userId.value.length >= maxUserIdLength) return;
    userId.value += value;
    if (userId.value.length === maxUserIdLength || Number(userId.value) * 10 > maxUserId) {
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
  if (pinCode.value.length === 0 && !enteringUserId.value) {
    switchInput();
  } else {
    if (enteringUserId.value) userId.value = userId.value.slice(0, -1);
    if (!enteringUserId.value) pinCode.value = pinCode.value.slice(0, -1);
  }
};

const switchInput = () => {
  enteringUserId.value = !enteringUserId.value;
  animateSwitch.value = true;
  setTimeout(() => {
    animateSwitch.value = false;
  }, 500);
};

const displayContainerClasses = computed(() => ({
  to: enteringUserId.value,
  from: !enteringUserId.value,
  animating: animateSwitch.value,
  switched: !enteringUserId.value && !animateSwitch.value,
}));

const login = async () => {
  loggingIn.value = true;
  await authStore.gewisPinlogin(userId.value, pinCode.value, ApiService).then(async () => {
    const user = authStore.getUser;
    if (user === null) return;

    if (userStore.getActiveUsers.length === 0) await userStore.fetchUsers;
    useCartStore().setBuyer(user);
    userStore.fetchCurrentUserBalance(user.id, ApiService);

    await router.push({ path: '/cashier' });
    userId.value = '';
    pinCode.value = '';
    enteringUserId  .value = true;
  }).catch((error) => {
    console.error(error);
    pinCode.value = '';
    wrongPin.value = true;
  })
  loggingIn.value = false;
};

const handleContinue = () => {
  switchInput();
};

</script>

<style scoped>
.keypad-container {
  width: calc(3 * var(--key-size) + 2 * var(--key-gap-size));
  padding-top: 45px;
  margin: auto;
}

.display-container {
  display: flex;
  margin-bottom: 40px;
  justify-content: space-between;
}

.display-container.from.animating {
  transform: translateX(-126.5%);
  transition: transform 0.5s ease;
}

.display-container.to.animating {
  transform: translateX(126.5%);
  justify-content: flex-end;
  transition: transform 0.5s ease;
}

.display-container.switched {
  justify-content: flex-end;
}

.keypad-container,
.display-container {
  align-items: flex-start;
}

.home-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
