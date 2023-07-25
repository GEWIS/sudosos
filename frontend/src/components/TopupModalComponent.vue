<template>
  <Dialog v-model:visible="visible" modal header="Increase Saldo" :style="{ width: '50vw' }">
    <p>You will be topping up with €{{ amount }}</p>
    <form ref="payment" id="payment-form" v-show="!loading">
      <div id="payment-element">
        <!--Stripe.js injects the Payment Element-->
      </div>
    </form>

    <template #footer>
      <Button label="cancel" severity="secondary" outlined />
      <Button label="pay" severity="danger" />
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {ref} from "vue";

defineProps({
  amount: {
    type: Number,
    required: true,
  }
});

const visible = ref(false);
const loading = ref(false);
</script>
<style scoped>
@import "../styles/BasePage.css";

:deep(.p-panel-content) {
  padding-left: 1.25rem !important;
}

</style>
