<template>
  <Dialog
    v-model:visible="showDebtWarningDialog"
    :content-style="{ width: '35rem', maxWidth: '100%' }"
    :draggable="false"
    header="Warning!"
    modal
    :pt="{
      header: () => ({ class: ['dialog-header'] }),
      closeButton: () => ({ class: ['dialog-close'] }),
    }"
    :style="{ maxWidth: '95vw' }"
    @click="resetDialog"
  >
    <Message :icon="undefined" severity="warn">
      You cannot checkout as you are a user that cannot go into debt! <br />
      Please remove items or top up before you can continue.
    </Message>
  </Dialog>
  <AprilFoolsComponent
    :show="showAprilFools"
    @closed="onAprilFoolsClosed"
    @logout="logout"
    @update:show="showAprilFools = $event"
  />
  <AgeVerificationComponent
    :show="showAgeVerification"
    @confirmed="onAgeVerificationConfirmed"
    @denied="onAgeVerificationDenied"
    @update:show="showAgeVerification = $event"
  />
</template>

<script setup lang="ts">
import type { CheckoutFlow } from '@/composables/useCheckoutFlow';
import AprilFoolsComponent from '@/components/AprilFoolsComponent.vue';
import AgeVerificationComponent from '@/components/AgeVerificationComponent.vue';

const props = defineProps<{
  flow: CheckoutFlow;
}>();

// The flow is created once by the parent and never replaced, so its refs can
// be pulled out here and used directly in the template.
const {
  showDebtWarningDialog,
  resetDialog,
  showAprilFools,
  onAprilFoolsClosed,
  showAgeVerification,
  onAgeVerificationConfirmed,
  onAgeVerificationDenied,
  logout,
} = props.flow;
</script>

<style scoped lang="scss">
.dialog-header {
  background: var(--accent-color) !important;
  color: white !important;
}

.dialog-close {
  color: white !important;
}
</style>
