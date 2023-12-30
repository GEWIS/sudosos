<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Increase Saldo"
    :style="{ width: '500px' }"
    position="top"
    @show="pay"
    @hide="cancelPay"
    :draggable="false"
  >
    <p>{{ `${$t('c_currentBalance.topup')} ${formatPrice(dinero)}` }}</p>
    <form ref="payment" id="payment-form" v-show="!loading">
      <div id="payment-element">
        <!--Stripe.js injects the Payment Element-->
      </div>
    </form>

    <template #footer>
      <Button :label="$t('payment.pay').toUpperCase()" @click="submitPay"/>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
// TODO: Implement error handling when payments fail
// TODO: Clean-up code

import { computed, onBeforeMount, ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import apiService from '@/services/ApiService';
import type { Dinero } from "@sudosos/sudosos-client";
import { formatPrice } from "@/utils/formatterUtils";

const loading = ref(false);
const visible = ref(false);
const dinero = computed((): Dinero => {
  return {
    amount: props.amount * 100,
    precision: 2,
    currency: 'EUR'
  };
});


const props = defineProps({
  amount: {
    type: Number,
    required: true
  }
});

const stripe = ref();
const paymentElement = ref();
const elements = ref();
onBeforeMount(async () => {
  stripe.value = await loadStripe(`${import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY}`);
  console.warn(`${import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY}`);
});

const pay = async () => {
  visible.value = true;
  const deposit = {
    amount: {
      ...(dinero.value)
    }
  };
  await apiService.stripe.deposit(deposit).then((paymentIntent) => {
    elements.value = stripe.value.elements({ clientSecret: paymentIntent.data.clientSecret });
    paymentElement.value = elements.value.create('payment');
    paymentElement.value.mount('#payment-element');
  });
};

const submitPay = async () => {
  const { error } = await stripe.value.confirmPayment({
    elements: elements.value,
    confirmParams: {
      return_url: import.meta.env.VITE_APP_STRIPE_RETURN_URL
    }
  });
};

const cancelPay = async () => {
  visible.value = false;
  if (paymentElement.value) {
    paymentElement.value.destroy();
  }
};

</script>
<style scoped>
</style>
