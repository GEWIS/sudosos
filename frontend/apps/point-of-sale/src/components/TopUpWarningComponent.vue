<template>
  <Dialog
    v-model:visible="visible"
    :closable="false"
    :content-style="{ width: '35rem' }"
    :dismissable-mask="false"
    :draggable="false"
    header="Please Top-Up your SudoSOS balance"
    modal
    :pt="{
      header: () => ({ class: ['dialog-header'] }),
    }"
  >
    <Message :closable="false" :icon="undefined" severity="warn">
      Your account balance is currently
      <span style="color: red; font-weight: bold">€{{ formattedBuyerBalance }}</span
      ><br />
      Please first Top-Up your balance before proceeding.<br />
    </Message>
    <div class="qr-code" style="display: flex; justify-content: center; margin-top: 1rem">
      <img alt="" src="@/assets/sudosos-qr.png" style="width: 25rem" />
    </div>
    <div v-if="topUpProgress > 0" class="spinner-container">
      <ProgressSpinner animation-duration="5s" stroke-width="6" style="width: 100px; height: 100px" />
      <div class="spinner-text">{{ topUpProgress }}</div>
    </div>
    <div v-if="topUpProgress <= 0" class="mt-4 text-center">
      <button class="c-btn checkout font-medium red-button rounder text-3xl" @click="closeDialog">I Understand</button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/FormatUtils';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:show']);

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

const cartStore = useCartStore();

const checkUserInDebt = computed(() => cartStore.checkBuyerInDebt());

const formattedBuyerBalance = computed(() => {
  if (cartStore.buyerBalance == null) return null;
  const buyerBalance = cartStore.buyerBalance.amount;
  return formatPrice(buyerBalance);
});

const topUpProgress = ref(5);

let topUpInterval: number | undefined;

const showConfirmButton = ref(false);

const startTopUpCountdown = () => {
  topUpProgress.value = 5;
  showConfirmButton.value = false;

  const tickInterval = 1000;

  topUpInterval = window.setInterval(() => {
    if (topUpProgress.value > 0) {
      topUpProgress.value -= 1;
    } else {
      clearInterval(topUpInterval);
      showConfirmButton.value = true;
    }
  }, tickInterval);
};

const closeDialog = () => {
  visible.value = false;
};

onMounted(() => {
  if (checkUserInDebt.value) {
    startTopUpCountdown();
  }
});
</script>

<style scoped lang="scss">
.spinner-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 1rem auto;
}

.spinner-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
}

.red-button {
  background-color: red;
  color: white;
}

.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
