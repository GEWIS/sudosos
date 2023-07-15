<template>
  <div class="login-container">
    <div class="keypad-container">
      <div class="display-container" :class="{ 'to': enteringUserId, 'from': !enteringUserId, 'animating': animateSwitch, 'switched': !enteringUserId && !animateSwitch}">
        <KeypadDisplay :userId="userId" :pinCode="pinCode" :isActive="enteringUserId" />
      </div>
      <Keypad :value="keypadInput" @input="handleInput" @backspace="handleBackspace" @continue="handleContinue" />
      <!-- Your login content here -->
    </div>
  </div>
  <SettingsIcon />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import SettingsIcon from "@/components/SettingsIcon.vue";
import Keypad from "@/components/Keypad.vue";
import KeypadDisplay from "@/components/KeypadDisplay.vue";

const keypadInput = ref('');
let userId = keypadInput;
let pinCode = ref('');
const enteringUserId = ref(true);
const animateSwitch = ref(false);
let translateX = 0;
const handleInput = (value) => {
  // Handle input event emitted by the Keypad component
  keypadInput.value += value;
};

const handleBackspace = () => {
  if (keypadInput.value.length === 0) {
    if (!enteringUserId.value) {
      switchInput();
    }
  } else {
    keypadInput.value = keypadInput.value.slice(0, -1);
  }
};

const switchInput = () => {
  if (enteringUserId.value) {
    userId = keypadInput.value;
    keypadInput.value = '';
    pinCode = keypadInput;
  } else {
    pinCode = keypadInput.value;
    keypadInput.value = userId;
    userId = keypadInput;
  }
  enteringUserId.value = !enteringUserId.value;

  animateSwitch.value = true;
  setTimeout(() => {
    animateSwitch.value = false;
  }, 500);
};

const handleContinue = () => {
  switchInput();
};
</script>

<style scoped>
.login-container {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  font-family: Lato, Arial, sans-serif;
  height: calc(100vh - 160px);
  width: calc(100vw - 80px);
}

.keypad-container {
  width: 290px;
  margin: auto;
}

.display-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.display-container.from.animating {
  transform: translateX(-127%);
  transition: transform 0.5s ease;
}

.display-container.to.animating {
  transform: translateX(127%);
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
</style>
