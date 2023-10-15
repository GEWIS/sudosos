<template>
  <Dialog v-model:visible="visible" modal header="Increase Saldo" :style="{ width: '50vw' }" @show="pay">
    <p>{{ $t('c_currentSaldo.topup') + amount.toString() }}</p>
    <form ref="payment" id="payment-form" v-show="!loading">
      <div id="payment-element">
        <!--Stripe.js injects the Payment Element-->
      </div>
    </form>

    <template #footer>
      <Button label="cancel" severity="secondary" outlined @click="cancelPay" />
      <Button label="pay" severity="danger" @click="submitPay"/>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
// TODO: Implement error handling when payments fail
// TODO: Clean-up code

import {onBeforeMount, ref} from "vue";
import {loadStripe} from "@stripe/stripe-js";
import apiService from "@/services/ApiService";

const loading = ref(false);
const visible = ref(true);

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  }
});

const stripe = ref();
const paymentElement = ref();
const elements = ref();
onBeforeMount( async () => {
  stripe.value = await loadStripe(`${import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY}`);
});

const pay = async () => {
  const deposit = {
    amount: {
      amount: props.amount * 100,
      precision: 2,
      currency: 'EUR',
    },
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
      return_url: import.meta.env.VITE_APP_STRIPE_RETURN_URL,
    },
  });
};

const cancelPay = async () => {
  paymentElement.value.destroy();
  visible.value = false;
};
</script>
<style scoped>
@import '../styles/BasePage.css';

:deep(.p-panel-content) {
  padding-left: 1.25rem !important;
}
</style>
