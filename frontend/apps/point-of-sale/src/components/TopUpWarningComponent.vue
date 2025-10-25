<template>
  <Dialog
    v-model:visible="visible"
    :closable="false"
    :dismissable-mask="false"
    :draggable="false"
    header="Please Top-Up your SudoSOS balance"
    modal
    :style="{ width: '35rem' }"
  >
    <Message :closable="false" :icon="undefined" severity="warn">
      Your account balance is currently
      <span class="text-red-600 font-bold">€{{ formattedBuyerBalance }}</span>
      <br />
      Please first Top-Up your balance before proceeding.
    </Message>

    <div class="flex justify-center mt-4">
      <img alt="SudoSOS QR Code" class="w-[25rem]" src="@/assets/sudosos-qr.png" />
    </div>

    <div v-if="topUpProgress > 0" class="relative w-[100px] h-[100px] mx-auto my-4">
      <ProgressSpinner animation-duration="5s" stroke-width="6" style="width: 100px; height: 100px" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
        {{ topUpProgress }}
      </div>
    </div>

    <div v-if="topUpProgress <= 0" class="flex justify-center items-center mt-4">
      <Button class="text-xl px-6 py-3 understand-button" @click="closeDialog"> I Understand </Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Button from 'primevue/button';
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

const startTopUpCountdown = () => {
  topUpProgress.value = 5;

  const tickInterval = 1000;

  topUpInterval = window.setInterval(() => {
    if (topUpProgress.value > 0) {
      topUpProgress.value -= 1;
    } else {
      clearInterval(topUpInterval);
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
.understand-button {
  background-color: red;
  border-color: red;
  color: white;
}
</style>
