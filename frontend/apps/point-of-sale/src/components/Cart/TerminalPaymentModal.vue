<template>
  <Dialog
    v-model:visible="visible"
    class="w-120"
    :closable="false"
    :close-on-escape="false"
    :dismissable-mask="false"
    :draggable="false"
    header="Card payment"
    modal
    :pt="{
      header: () => ({ class: ['dialog-header'] }),
    }"
  >
    <div class="flex flex-col items-center gap-6 py-4">
      <!-- `idle` is covered too: the dialog is visible for a frame before
           startPayment flips the phase, and an empty dialog looks broken. -->
      <template v-if="phase === 'idle' || phase === 'preparing'">
        <ProgressSpinner />
        <p class="text-xl text-center">Sending to the terminal...</p>
      </template>

      <template v-else-if="phase === 'waiting'">
        <ProgressSpinner />
        <p class="text-2xl font-semibold text-center">{{ formattedAmount }}</p>
        <p class="text-xl text-center">Let the customer tap or insert their card on the terminal.</p>
        <p class="text-center opacity-70">
          The terminal keeps asking until the payment goes through. Press Cancel to give up on this payment.
        </p>
      </template>

      <template v-else-if="phase === 'cancelled'">
        <Message :icon="undefined" severity="warn">The payment was cancelled. Nothing has been charged.</Message>
      </template>

      <template v-else-if="phase === 'error'">
        <Message :icon="undefined" severity="error">{{ errorMessage }}</Message>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-center w-full">
        <Button
          v-if="phase === 'waiting'"
          class="terminal-cancel text-xl px-6 py-3"
          :disabled="cancelling"
          @click="onCancel"
        >
          <ProgressSpinner v-if="cancelling" class="button-spinner" stroke-width="4" />
          <span v-else>Cancel</span>
        </Button>
        <Button
          v-else-if="phase === 'cancelled' || phase === 'error'"
          class="terminal-close text-xl px-6 py-3"
          :disabled="closing"
          @click="close"
        >
          <ProgressSpinner v-if="closing" class="button-spinner" stroke-width="4" />
          <span v-else>Close</span>
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useCartStore } from '@/stores/cart.store';
import { useTerminalPaymentStore } from '@/stores/terminalPayment.store';
import { usePosToken } from '@/composables/usePosToken';
import { playAudio, Sound } from '@/utils/audioUtil';
import { formatDineroObjectToString } from '@/utils/FormatUtils';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'paid'): void;
}>();

const toast = useToast();
const cartStore = useCartStore();
const terminalPaymentStore = useTerminalPaymentStore();
const { getPosUserIdFromToken } = usePosToken();

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

const phase = computed(() => terminalPaymentStore.phase);
const errorMessage = computed(() => terminalPaymentStore.errorMessage);

/**
 * The amount is frozen when the payment is created, so show what the backend
 * recorded rather than the live cart total.
 */
const formattedAmount = computed(() => {
  const amount = terminalPaymentStore.getPayment?.amount;
  return amount ? formatDineroObjectToString(amount) : '';
});

/** Guards against the watcher firing twice for one opening. */
const starting = ref(false);

const cancelling = ref(false);
const closing = ref(false);

const close = () => {
  if (closing.value) return;

  closing.value = true;
  terminalPaymentStore.reset();
  visible.value = false;
};

const start = async () => {
  const posUserId = getPosUserIdFromToken();
  if (posUserId === null) {
    toast.add({
      severity: 'error',
      summary: 'This device is not linked to a point of sale, so it cannot take card payments.',
      life: 5000,
    });
    visible.value = false;
    return;
  }

  // Both `from` and `createdBy` are the POS itself. Beyond matching the
  // anonymous-sale semantics, it keeps the payment inside the POS token's
  // `own` RBAC relation for its whole lifecycle -- including after a
  // cancellation detaches the temporary transaction.
  const request = cartStore.buildTransactionRequest(posUserId, posUserId);
  if (!request) {
    toast.add({ severity: 'error', summary: 'Could not build the transaction for this cart.', life: 5000 });
    visible.value = false;
    return;
  }

  try {
    await terminalPaymentStore.startPayment(request);
  } catch {
    // startPayment has already put the reason on the store for display.
  }
};

watch(
  visible,
  async (isVisible) => {
    if (!isVisible || starting.value) return;

    // The component is never unmounted between payments, so clear the guards
    // from the previous one before the footer is shown again.
    cancelling.value = false;
    closing.value = false;

    starting.value = true;
    try {
      await start();
    } finally {
      starting.value = false;
    }
  },
  { immediate: true },
);

watch(
  () => terminalPaymentStore.phase,
  async (newPhase) => {
    if (newPhase !== 'paid') return;

    playAudio(Sound.CASHOUT);
    await cartStore.clearAfterCheckout();
    terminalPaymentStore.reset();
    visible.value = false;
    emit('paid');
  },
);

const onCancel = async () => {
  if (cancelling.value) return;

  cancelling.value = true;
  try {
    await terminalPaymentStore.cancelPayment();
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Could not cancel the payment. Check the terminal before trying again.',
      life: 5000,
    });
  } finally {
    cancelling.value = false;
  }
};

onUnmounted(() => {
  terminalPaymentStore.stopListening();
});
</script>

<style scoped lang="scss">
.dialog-header {
  background: var(--accent-color) !important;
  color: white !important;
}

.terminal-cancel {
  background-color: red;
  color: white;
  border: none;
}

.terminal-close {
  border: none;
}

.button-spinner {
  width: 30px;
  height: 30px;
  --p-progressspinner-color-one: white;
  --p-progressspinner-color-two: white;
  --p-progressspinner-color-three: white;
  --p-progressspinner-color-four: white;
}
</style>
