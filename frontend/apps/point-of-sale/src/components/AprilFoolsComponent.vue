<template>
  <Dialog v-model:visible="visible" class="w-100" :closable="false" :dismissable-mask="false" :draggable="false" modal>
    <div class="flex flex-col justify-center items-center mt-4 gap-4">
      <img alt="SudoSOS QR Code" class="h-72" src="@/assets/aprilfools.png" />

      <h1 class="text-2xl font-bold">Steekproef</h1>

      <div class="w-[60%] text-center">
        <p>Thank you for your understanding, an employee will come by to check if everything was done correctly.</p>
      </div>

      <div v-if="captchaVisible" class="flex flex-col items-center gap-3 w-full">
        <div class="captcha-box flex flex-col items-center gap-2 w-[80%] p-4 rounded-lg">
          <p class="text-sm font-semibold text-center captcha-label">
            No employee available? Solve this CAPTCHA instead.
          </p>
          <p class="text-lg font-bold captcha-question">{{ captchaQuestion }}</p>
          <div class="flex flex-row items-center gap-2">
            <input
              v-model="captchaInput"
              class="captcha-input text-center text-lg w-24 rounded-md border p-2 h-10"
              placeholder="?"
              type="number"
              @keyup.enter="verifyCaptcha"
            />
            <Button class="continue-button h-10" :disabled="captchaInput === ''" @click="verifyCaptcha">Verify</Button>
          </div>
          <p class="text-xs captcha-attempts">Attempts remaining: {{ MAX_ATTEMPTS - captchaAttempts }}</p>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:show', 'closed', 'logout']);

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

const captchaVisible = ref(false);

const captchaA = ref(0);
const captchaB = ref(0);
const captchaInput = ref<string>('');
const captchaAttempts = ref(0);
const MAX_ATTEMPTS = 3;

const captchaQuestion = computed(() => `What is ${captchaA.value} + ${captchaB.value}?`);

function generateCaptcha() {
  captchaA.value = Math.floor(Math.random() * 9999) + 1;
  captchaB.value = Math.floor(Math.random() * 9999) + 1;
  captchaInput.value = '';
}

function verifyCaptcha() {
  const answer = parseInt(captchaInput.value, 10);
  if (answer === captchaA.value + captchaB.value) {
    close();
  } else {
    captchaAttempts.value++;
    if (captchaAttempts.value >= MAX_ATTEMPTS) {
      emit('logout');
      toast.add({
        severity: 'error',
        summary: `CAPTCHA failed too many times, transaction cancelled`,
        life: 5000,
      });
    } else {
      generateCaptcha();
    }
  }
}

let captchaTimer: ReturnType<typeof setTimeout> | undefined;

watch(visible, (isVisible) => {
  if (isVisible) {
    captchaVisible.value = false;
    captchaAttempts.value = 0;
    generateCaptcha();
    captchaTimer = setTimeout(() => {
      captchaVisible.value = true;
    }, 5000);
  } else {
    clearTimeout(captchaTimer);
  }
});

const close = () => {
  visible.value = false;
  emit('closed');
};
</script>

<style scoped lang="scss">
.continue-button {
  background-color: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: var(--p-primary-inverse-color);
}

.captcha-box {
  background-color: var(--p-surface-100, #f5f5f5);
  border: 1px solid var(--p-surface-300, #ccc);
}

.captcha-label {
  color: var(--p-text-muted-color, #666);
}

.captcha-question {
  color: var(--p-text-color, #333);
}

.captcha-input {
  border-color: var(--p-surface-400, #aaa);
  background-color: var(--p-surface-0, #fff);
  color: var(--p-text-color, #333);

  &:focus {
    outline: 2px solid var(--p-primary-color);
    border-color: var(--p-primary-color);
  }

  /* Hide number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
}

.captcha-attempts {
  color: var(--p-text-muted-color, #888);
}
</style>
