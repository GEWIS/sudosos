<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    header="Increase Saldo"
    modal
    position="top"
    :style="{ width: '500px' }"
    @hide="cancelPay"
    @show="pay"
  >
    <div class="mb-4 mt-4">
      <p>{{ `${t('modules.user.balance.topUp')} ${formatPrice(dinero)}` }}</p>
    </div>
    <form v-show="!loading" id="payment-form" ref="payment">
      <div id="payment-element">
        <!--Stripe.js injects the Payment Element-->
      </div>
    </form>

    <template #footer>
      <Button class="h-9" :disabled="loading" :label="t('modules.user.balance.pay').toUpperCase()" @click="submitPay" />
    </template>
  </Dialog>
</template>
<script setup lang="ts">
// TODO: Implement error handling when payments fail
// TODO: Clean-up code

import { computed, onBeforeMount, ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js/pure';
import type { PaymentIntentResult } from '@stripe/stripe-js';
import type { Dinero } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import apiService from '@/services/ApiService';
import { formatPrice } from '@/utils/formatterUtils';
import { useSettingsStore } from '@/stores/settings.store';

const { t } = useI18n();

const loading = ref(false);
const visible = ref(false);
const dinero = computed((): Dinero => {
  return {
    amount: Math.round(props.amount * 100),
    precision: 2,
    currency: 'EUR',
  };
});

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
});

const toast = useToast();
const stripe = ref();
const paymentElement = ref();
const elements = ref();
const settingStore = useSettingsStore();
onBeforeMount(async () => {
  loadStripe.setLoadParameters({ advancedFraudSignals: false });
  stripe.value = await loadStripe(`${settingStore.getStripe}`);
});

const pay = async () => {
  visible.value = true;
  const deposit = {
    amount: {
      ...dinero.value,
    },
  };
  await apiService.stripe.deposit(deposit).then((paymentIntent) => {
    elements.value = stripe.value.elements({ clientSecret: paymentIntent.data.clientSecret });
    paymentElement.value = elements.value.create('payment');
    paymentElement.value.mount('#payment-element');
  });
};

const submitPay = async () => {
  if (loading.value) return; // Early return if confirmation is already (being) sent.
  // Set loading to ensure that the payment button is disabled and cannot be pressed again.
  loading.value = true;
  await stripe.value
    .confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: window.location.origin,
      },
    })
    .then((result: PaymentIntentResult) => {
      if (result.error) {
        // Issue on Stripe's side, close modal and show toast.
        visible.value = false;
        toast.add({
          severity: 'error',
          summary: t('common.toast.failed.failed'),
          detail: t('common.toast.failed.topUp.unable'),
          life: 3000,
        });
      }
    })
    .finally(() => {
      // If the top-up succeeds, this will not matter as the user is redirected.
      loading.value = false;
    });
};

const cancelPay = () => {
  visible.value = false;
  if (paymentElement.value) {
    paymentElement.value.destroy();
  }
};
</script>
<style scoped></style>
